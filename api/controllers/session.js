const _ = require('lodash');
const chargepoint = require('../lib/chargepoint');
const twilio = require('../lib/twilio');

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

    const query = {};
    if (req.params.session_id && req.params.session_id !== 'current') {
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

    return chargepoint.sendStatusRequest(req.user_id).tap((chargingStatus) => {
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

      // NOTES
      // After unplugging, `current_charging` will become `done`

      // This session is stopped
      // Do nothing
      if (status === 'off') {
        console.log(`-----> Session: ${sessionId} is stopped.`);
        return false;
      }

      // This session is fully charged but hasn't been stopped
      if (status !== 'stopping' && currentCharging === 'fully_charged') {
        console.log(`-----> Session: ${sessionId} is fully charged.`);
        return false;
      }

      // This session is stopping but still plugged in
      // Do nothing
      // Waiting to be unplugged...
      if (status === 'stopping' && currentCharging === 'in_use') {
        console.log(`-----> Session: ${sessionId} is stopping.`);
        return false;
      }

      // This session is new and hasn't begun charging
      // This is a transitory state, happens when a charge first starts
      // Wait for `current_charging` to become `in_use`
      if (status === 'starting' && currentCharging === 'not_charging') {
        console.log(`-----> Session: ${sessionId} is starting.`);
        return false;
      }

      // This session is actively charging
      if (status === 'starting' && currentCharging === 'in_use') {
        console.log(`-----> Session: ${sessionId} is being started.`);
        // Turn on the session
        session.set('status', 'on');
        return true;
      }

      // This session is done and unplugged
      // Turn off the session permanently
      if (status === 'on' && currentCharging === 'done') {
        console.log(`-----> Session: ${sessionId} is being stopped.`);
        // Turn off the session
        session.set('status', 'off');
        return true;
      }

      // This session is almost done charging
      // Charging rate has dropped below `POWER_KW_MIN`
      // And has been charging at least `CHARGING_TIME_MIN`
      if (status === 'on' &&
        currentCharging === 'in_use' &&
        paymentType === 'paid' &&
        powerKw > 0 &&
        powerKw < POWER_KW_MIN &&
        chargingTime > CHARGING_TIME_MIN) {
        console.log(`-----> Session: ${sessionId} is being stopped.`);

        // Send a stop request to Chargepoint
        return chargepoint.sendStopRequest(
          req.user_id,
          session.get('device_id'),
          session.get('outlet_number')
        ).tap((body) => {
          if (!body.stop_session || !body.stop_session.status) {
            throw new Error(`Invalid response from Chargepoint.`);
          }

          // Stop the session
          session.set('status', 'stopping');

          // Save `ack_id` from Chargepoint
          // This is used to monitor the status of a stop request
          session.set('ack_id', body.stop_session.ack_id);
        }).tap(() => {
          // Send SMS notification via Twilio
          return twilio.sendNotification({
            body: `Stopped: ${sessionId} for device: ${deviceId} on port: ${outletNumber}`,
          }).tap((body) => {
            console.log(`-----> Stop notification sent: ${body.sid}.`);
          });
        }).catch((err) => {
          // Ignore errors
          console.error(`-----> Session: ${sessionId} failed to stop with error: ${err.message}.`);
        }).return(true);
      }

      // This session is currently active
      console.log(`-----> Session: ${sessionId} is active.`);
      return true;
    }).tap((shouldSave) => {
      // Save Session
      if (shouldSave) {
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

    return sessions.fetch(qo).tap(() => {
      res.data = sessions.render();
      next();
    }).catch(next);
  },

  stop(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');

    return session.fetch({
      query: {
        session_id: _.parseInt(req.params.session_id),
      },
    }).then(() => {
      return chargepoint.sendStopRequest(
        req.user_id,
        session.get('device_id'),
        session.get('outlet_number')
      );
    }).then((body) => {
      res.data = body;
      next();
    }).catch(next);
  },

  stopAck(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');

    return session.fetch({
      query: {
        session_id: _.parseInt(req.params.session_id),
      },
    }).then(() => {
      return chargepoint.sendStopAckRequest(req.user_id, session.get('ack_id'));
    }).then((body) => {
      res.data = body;
      next();
    }).catch(next);
  },
});
