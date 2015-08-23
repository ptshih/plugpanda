const _ = require('lodash');

const POWER_KW_MIN = 5;
const CHARGING_TIME_MIN = 300000;

const authenticateUserMiddleware = require('../middleware/authenticate_user');
const authenticateWorkerMiddleware = require('../middleware/authenticate_worker');

const BaseController = require('./base');
const SessionModel = require('../models/session');
const SessionCollection = require('../collections/session');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/session'] = {
      action: this.session,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.get['/session/status'] = {
      action: this.status,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.get['/session/worker'] = {
      action: this.status,
      middleware: [authenticateWorkerMiddleware, authenticateUserMiddleware],
    };

    this.routes.get['/sessions'] = {
      action: this.history,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.get['/sessions/:session_id'] = {
      action: this.session,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.post['/sessions/:session_id/stop'] = {
      action: this.stop,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.post['/sessions/:session_id/stop_ack'] = {
      action: this.stopAck,
      middleware: [authenticateUserMiddleware],
    };
  },

  session(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');
    session.user_id = req.user_id;

    const query = {};
    if (req.params.session_id) {
      query.session_id = _.parseInt(req.params.session_id);
    }

    return session.fetch({
      query: query,
      require: true,
      sort: [['updated', 'desc']],
    }).then(() => {
      res.data = session.render();
      next();
    }).catch(next);
  },

  status(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');
    session.user_id = req.user_id;

    return session.sendStatusRequest().tap((chargingStatus) => {
      // Fetch from DB
      return session.fetch({
        query: {
          session_id: chargingStatus.session_id,
        },
      }).tap(() => {
        // Update from Chargepoint
        session.setFromChargepoint(chargingStatus);
      });
    }).then(() => {
      // Session Status
      const sessionId = session.get('session_id');
      const deviceId = session.get('device_id');
      const outletNumber = session.get('outlet_number');
      const status = session.get('status');
      const currentCharging = session.get('current_charging');
      const powerKw = session.get('power_kw');
      const chargingTime = session.get('charging_time');
      const paymentType = session.get('payment_type');

      // This session is terminated, do nothing
      if (status === 'off') {
        console.log(`-----> Session: ${sessionId} is terminated.`);
        return false;
      }

      // This session is being started
      if (status === 'starting' && currentCharging === 'not_charging') {
        console.log(`-----> Session: ${sessionId} is being started.`);
        return true;
      }

      // This session is done, regardless of status
      if (currentCharging === 'done') {
        // Turn off the session
        console.log(`-----> Session: ${sessionId} is being terminated.`);
        session.set('status', 'off');
        return true;
      }

      // When session is stopping but still `in_use`, do nothing
      // After unplugging, `current_charging` will become `done`
      if (status === 'stopping' && currentCharging === 'in_use') {
        // Waiting to be unplugged...
        console.log(`-----> Session: ${sessionId} is stopped.`);
        return false;
      }

      // This is a new active session
      if (status === 'starting' && currentCharging === 'in_use') {
        // Turn on the session
        console.log(`-----> Session: ${sessionId} is being activated.`);
        session.set('status', 'on');
        return true;
      }

      // This is a currently active session
      // Check `power_kw` and `charging_time`
      if (status === 'on' &&
        currentCharging === 'in_use' &&
        paymentType === 'paid' &&
        powerKw > 0 &&
        powerKw < POWER_KW_MIN &&
        chargingTime > CHARGING_TIME_MIN) {
        console.log(`-----> Session: ${sessionId} is being stopped.`);
        // Conditions met, stop session
        return session.sendStopRequest().tap((body) => {
          if (!body.stop_session || !body.stop_session.status) {
            throw new Error(`Failed to stop session -> ${sessionId}.`);
          }

          // Stop the session
          session.set('status', 'stopping');

          // Save `ack_id`
          if (body.stop_session.ack_id) {
            session.set('ack_id', body.stop_session.ack_id);
          }
        }).tap(() => {
          // Send SMS notification via Twilio
          return session.sendNotification({
            body: `Stopped: ${sessionId} for device: ${deviceId} on port: ${outletNumber}`,
          }).tap((body) => {
            console.log(`-----> Stop notification sent: ${body.sid}.`);
          });
        }).catch((err) => {
          // Ignore errors
          console.error(`-----> Failed to stop session: ${sessionId} with error: ${err.message}.`);
        }).return(true);
      }

      // Currently active session, should not be stopped
      console.log(`-----> Session: ${sessionId} is activated.`);
      return true;
    }).tap((shouldUpdate) => {
      // Save Session
      if (shouldUpdate) {
        console.log(`-----> Saving Session: ${session.get('session_id')}.`);
        return session.save();
      }
    }).then(() => {
      res.data = session.render();
      next();
    }).catch(next);
  },

  history(req, res, next) {
    const qo = this.parseQueryString(req, {
      queryParams: {
        status: 'string',
        current_charging: 'string',
        payment_type: 'string',
        device_id: 'integer',
      },
      sortParam: 'updated',
      sortOrder: 'desc',
    });

    const sessions = new SessionCollection();
    sessions.db = this.get('db');
    sessions.user_id = req.user_id;

    return sessions.fetch(qo).tap(() => {
      res.data = sessions.render();
      next();
    }).catch(next);
  },

  stop(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');
    session.user_id = req.user_id;

    return session.fetch({
      query: {
        session_id: _.parseInt(req.params.session_id),
      },
    }).then(() => {
      return session.sendStopRequest();
    }).then((body) => {
      res.data = body;
      next();
    }).catch(next);
  },

  stopAck(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');
    session.user_id = req.user_id;

    return session.fetch({
      query: {
        session_id: _.parseInt(req.params.session_id),
      },
    }).then(() => {
      return session.sendStopAckRequest();
    }).then((body) => {
      res.data = body;
      next();
    }).catch(next);
  },
});
