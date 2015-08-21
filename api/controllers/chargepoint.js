const POWER_KW_MIN = 5;
const CHARGING_TIME_MIN = 300000;

const _ = require('lodash');
const Muni = require('muni');

// Twilio
const twilio = require('twilio')(
  nconf.get('TWILIO_ACCOUNT_SID'),
  nconf.get('TWILIO_AUTH_TOKEN')
);
Muni.Promise.promisifyAll(twilio);

const BaseController = require('./base');
const SessionModel = require('../models/session');
const SessionCollection = require('../collections/session');
const request = require('../lib/request');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/chargepoint/test_notification'] = {
      action: this.testNotification,
      middleware: [],
    };

    this.routes.get['/chargepoint/status'] = {
      action: this.status,
      middleware: [],
    };

    this.routes.get['/chargepoint/history'] = {
      action: this.history,
      middleware: [],
    };

    this.routes.post['/chargepoint/stop'] = {
      action: this.stop,
      middleware: [],
      requiredParams: ['device_id', 'port_number'],
    };

    this.routes.post['/chargepoint/stop_ack'] = {
      action: this.stopAck,
      middleware: [],
      requiredParams: ['ack_id'],
    };
  },


  testNotification(req, res, next) {
    const sessionId = 12345;
    const deviceId = 67890;
    const outletNumber = 1;

    return this._sendNotification({
      body: `Stopped: ${sessionId} for device: ${deviceId} on port: ${outletNumber}`,
    }).then((data) => {
      res.json(data);
    }).catch(next);
  },

  /**
   * Get most recent charging session from Chargepoint
   *
   * Steps
   * 1. Fetch most recent session from Chargepoint API
   * 2. Fetch Session from db based on `session_id`
   * 3. Modify `status` based on defined logic
   * 4. Save the Session to db
   *
   */
  status(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');

    return this._sendStatusRequest().tap((body) => {
      // Response from Chargepoint
      const chargingStatus = body.charging_status;

      // Fetch from DB
      return session.fetch({
        query: {
          session_id: chargingStatus.session_id,
        },
      }).tap(() => {
        // Update from Chargepoint
        session.setFromChargepoint(chargingStatus);

        // TODO: test
        // session.set('current_charging', 'active');
      });
    }).tap(() => {
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
        return session;
      }

      // This session is being started
      if (status === 'starting' && currentCharging === 'not_charging') {
        console.log(`-----> Session: ${sessionId} is being started.`);
        return session;
      }

      // This session is done, regardless of status
      if (currentCharging === 'done') {
        // Turn off the session
        console.log(`-----> Session: ${sessionId} is being terminated.`);
        session.set('status', 'off');
        return session;
      }

      // When session is stopping but still `in_use`, do nothing
      // After unplugging, `current_charging` will become `done`
      if (status === 'stopping' && currentCharging === 'in_use') {
        // Waiting to be unplugged...
        console.log(`-----> Session: ${sessionId} is stopped.`);
        return session;
      }

      // This is a new active session
      if (status === 'starting' && currentCharging === 'in_use') {
        // Turn on the session
        console.log(`-----> Session: ${sessionId} is being activated.`);
        session.set('status', 'on');
        return session;
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
        console.log(`-----> Device: ${deviceId}, Port: ${outletNumber}.`);
        // Conditions met, stop session
        return this._sendStopRequest(deviceId, outletNumber).tap((body) => {
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
          return this._sendNotification({
            body: `Stopped: ${sessionId} for device: ${deviceId} on port: ${outletNumber}`,
          }).tap((body) => {
            console.log(`-----> Stop notification sent: ${body.sid}.`);
          });
        }).catch((err) => {
          // Ignore errors
          console.error(`-----> Failed to stop session: ${sessionId} with error: ${err.message}.`);
          return session;
        }).return(session);
      }

      // Currently active session, should not be stopped
      console.log(`-----> Session: ${sessionId} is activated.`);
      return session;
    }).tap(() => {
      // Save Session
      return session.save();
    }).then(() => {
      // Respond with Session
      res.json(session.render());
    }).catch(next);
  },

  /**
   * Get history of all charging sessions
   */
  history(req, res, next) {
    const sessions = new SessionCollection();
    sessions.db = this.get('db');

    return sessions.fetch({
      sort: [['updated', 'desc']],
    }).tap(() => {
      res.json(sessions.render());
    }).catch(next);
  },

  /**
   * Send a STOP request for a station/port to Chargepoint
   */
  stop(req, res, next) {
    return this._sendStopRequest(
      req.body.device_id,
      req.body.port_number
    ).then((body) => {
      res.json(body);
    }).catch(next);
  },

  /**
   * Check on the status of a STOP request
   */
  stopAck(req, res, next) {
    return this._sendStopAckRequest(
      req.body.ack_id
    ).then((body) => {
      res.json(body);
    }).catch(next);
  },


  // Get latest charging session from Chargepoint
  _sendStatusRequest: Muni.Promise.method(() => {
    return request.send({
      url: 'https://mc.chargepoint.com/map-prod/v2?{"charging_status":{},"user_id":419469}',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
    });
  }),

  // UNUSED
  // Get all charging sessions from Chargepoint
  _sendActivityRequest: Muni.Promise.method(() => {
    return request.send({
      url: 'https://mc.chargepoint.com/map-prod/v2?{"charging_activity":{"page_size":100},"user_id":419469}',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
    });
  }),

  // Send a STOP request to a Chargepoint Station/Port
  _sendStopRequest: Muni.Promise.method((deviceId, portNumber) => {
    if (!deviceId || !portNumber) {
      throw new Error('Missing `device_id` or `port_number`.');
    }

    return request.send({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
      json: {
        user_id: 419469,
        stop_session: {
          device_id: deviceId,
          port_number: portNumber,
        },
      },
    });
  }),

  // Send an ACK request for a previous STOP request
  _sendStopAckRequest: Muni.Promise.method((ackId) => {
    if (!ackId) {
      throw new Error('Missing `ack_id`.');
    }

    return request.send({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
      json: {
        user_id: 419469,
        session_ack: {
          ack_id: ackId,
          session_action: 'stop_session',
        },
      },
    });
  }),

  // Send SMS via Twilio
  _sendNotification: Muni.Promise.method((options) => {
    options.to = options.to || '+18085183808';
    options.from = options.from || '+14158861337';

    if (!_.isString(options.body)) {
      throw new Error('Missing Notification Text.');
    }

    return twilio.sendMessage(options);
  }),
});
