const POWER_KW_MIN = 5;
const CHARGING_TIME_MIN = 300000;

const nconf = require('nconf');
const _ = require('lodash');
const Muni = require('muni');
const request = Muni.Promise.promisify(require('request'));
Muni.Promise.promisifyAll(request);
const twilio = require('twilio')(
  nconf.get('TWILIO_ACCOUNT_SID'),
  nconf.get('TWILIO_AUTH_TOKEN')
);
Muni.Promise.promisifyAll(twilio);

const BaseController = require('./base');
const SessionModel = require('../models/session');
const SessionCollection = require('../collections/session');

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
      body: `Stopped session: ${sessionId} for device: ${deviceId} on port: ${outletNumber}`,
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
      const deviceId = session.get('deviceId');
      const outletNumber = session.get('outlet_number');
      const status = session.get('status');
      const currentCharging = session.get('current_charging');
      const powerKw = session.get('power_kw');
      const chargingTime = session.get('charging_time');
      const paymentType = session.get('payment_type');

      // This session is done, regardless of status
      if (currentCharging === 'done') {
        // Turn off the session
        session.set('status', 'off');
        return session;
      }

      // When session is stopping but still `in_use`, don't do anything
      // After unplugging, `current_charging` will become `done`
      if (status === 'stopping' && currentCharging === 'in_use') {
        // Waiting to be unplugged...
        return session;
      }

      // This is a new active session
      if (status === 'starting' && currentCharging === 'in_use') {
        // Turn on the session
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
        chargingTime >= CHARGING_TIME_MIN) {
        // Send API to STOP
        return this._sendStopRequest(deviceId, outletNumber).tap((body) => {
          if (body.stop_session) {
            if (body.stop_session.status) {
              session.set('status', 'stopping');
            }
            if (body.stop_session.ack_id) {
              session.set('ack_id', body.stop_session.ack_id);
            }
          }
        }).tap(() => {
          // Send SMS notification via Twilio
          return this._sendNotification({
            body: `Stopped session: ${sessionId} for device: ${deviceId} on port: ${outletNumber}`,
          });
        }).catch(() => {
          // Ignore errors
          return session;
        }).return(session);
      }

      // Currently active session, should not be stopped
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

    return sessions.fetch().tap(() => {
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


  _request: Muni.Promise.method((options = {}) => {
    _.defaults(options, {
      withCredentials: false,
      json: true,
    });

    return request(options).then((contents) => {
      const response = contents[0];
      const statusMessage = response.statusMessage || 'Client Error';
      const statusCode = response.statusCode || 500;
      if (statusCode >= 400 && statusCode < 500) {
        const clientErr = new Error(statusMessage);
        clientErr.code = statusCode;
        throw clientErr;
      }

      const body = contents[1];
      return body;
    });
  }),

  // Get latest charging session from Chargepoint
  _sendStatusRequest: Muni.Promise.method(function _sendStatusRequest() {
    return this._request({
      url: 'https://mc.chargepoint.com/map-prod/v2?{"charging_status":{},"user_id":419469}',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
    });
  }),

  // UNUSED
  // Get all charging sessions from Chargepoint
  _sendActivityRequest: Muni.Promise.method(function _sendActivityRequest() {
    return this._request({
      url: 'https://mc.chargepoint.com/map-prod/v2?{"charging_activity":{"page_size":100},"user_id":419469}',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
    });
  }),

  // Send a STOP request to a Chargepoint Station/Port
  _sendStopRequest: Muni.Promise.method(function _sendStopRequest(deviceId, portNumber) {
    if (!deviceId || !portNumber) {
      throw new Error('Missing `device_id` or `port_number`.');
    }

    return this._request({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
      json: {
        stop_session: {
          device_id: deviceId,
          port_number: portNumber,
        },
      },
    });
  }),

  // Send an ACK request for a previous STOP request
  _sendStopAckRequest: Muni.Promise.method(function _sendStopAckRequest(ackId) {
    if (!ackId) {
      throw new Error('Missing `ack_id`.');
    }

    return this._request({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
      json: {
        session_ack: {
          ack_id: ackId,
          session_action: 'stop_session',
        },
      },
    });
  }),

  _sendNotification: Muni.Promise.method(function _sendNotification(options) {
    options.to = options.to || '+18085183808';
    options.from = options.from || '+14158861337';

    if (!_.isString(options.body)) {
      throw new Error('Missing Notification Text.');
    }

    return twilio.sendMessage(options);
  }),
});
