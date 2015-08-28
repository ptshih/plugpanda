const _ = require('lodash');

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

    return session.currentSessionStatus(req.user_id).tap((chargingStatus) => {
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
      const status = session.get('status');
      const currentCharging = session.get('current_charging');

      // NOTES
      // After unplugging, `current_charging` will become `done`
      if (currentCharging === 'done') {
        // This session is done and unplugged
        // Turn off the session permanently
        console.log(`-----> Session: ${sessionId} is done and unplugged.`);
        session.set('status', 'off');
        return true;
      } else if (currentCharging === 'not_charging') {
        // This session is warming up and plugged in
        console.log(`-----> Session: ${sessionId} is not charging.`);
        session.set('status', 'starting');
        return true;
      } else if (currentCharging === 'in_use') {
        // The session is actively charging and plugged in
        if (status === 'stopping') {
          // This session is stopping
          console.log(`-----> Session: ${sessionId} is stopping.`);
          // Don't save
          return false;
        } else if (status === 'starting') {
          // This session was starting
          // Start the session
          session.set('status', 'on');
          console.log(`-----> Session: ${sessionId} is starting.`);
          return true;
        } else if (status === 'on') {
          // This session is tapering and is almost done charging
          // Charging rate has dropped below `POWER_KW_MIN`
          // And has been charging at least `CHARGING_TIME_MIN`
          if (session.shouldStopSession()) {
            console.log(`-----> Session: ${sessionId} should be stopped.`);
            return session.stopSession(req.user_id).then((stopSession) => {
              // Stop the session
              // Save `ack_id` from Chargepoint
              // This is used to monitor the status of a stop request
              session.set('status', 'stopping');
              session.set('ack_id', stopSession.ack_id);
              return true;
            }).catch((err) => {
              // Ignore errors
              console.error(`-----> Session: ${sessionId} failed to stop with error: ${err.message}.`);
              return true;
            });
          }

          // This session is actively charging and updating
          console.log(`-----> Session: ${sessionId} is actively charging.`);
          return true;
        }

        // `status` is `off`
        return false;
      } else if (currentCharging === 'fully_charged') {
        // This session is fully charged and plugged in
        console.log(`-----> Session: ${sessionId} is fully charged.`);

        return session.stopSession(req.user_id).then((stopSession) => {
          // Stop the session
          // Save `ack_id` from Chargepoint
          // This is used to monitor the status of a stop request
          session.set('status', 'stopping');
          session.set('ack_id', stopSession.ack_id);
          return true;
        }).catch((err) => {
          // Ignore errors
          console.error(`-----> Session: ${sessionId} failed to stop with error: ${err.message}.`);
          return true;
        });
      }

      // Unknown session status
      console.log(`-----> Session: ${sessionId} has unknown charging status: ${currentCharging}.`);
      return false;
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
      return session.stopSession(req.user_id);
    }).then((stopSession) => {
      res.data = stopSession;
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
      return session.stopSessionAck(req.user_id);
    }).then((body) => {
      res.data = body;
      next();
    }).catch(next);
  },
});
