const nconf = require('nconf');
const _ = require('lodash');
const Muni = require('muni');
const request = Muni.Promise.promisify(require('request'));
Muni.Promise.promisifyAll(request);

const BaseController = require('./base');
const SessionModel = require('../models/session');
const SessionCollection = require('../collections/session');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

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
      const status = session.get('status');
      const currentCharging = session.get('current_charging');

      // When session is stopping, don't do anything
      // After unplugging, `current_charging` will become `done`
      if (status === 'stopping' && currentCharging !== 'done') {
        // Waiting to be unplugged...
        return;
      }

      // This session was active/stopping but is NOT anymore
      if ((status === 'on' || status === 'stopping') && currentCharging === 'done') {
        // Turn off the session
        session.set('status', 'off');
        return;
      }

      // This is a new active session
      if (status === 'off' && currentCharging !== 'done') {
        // Turn on the session
        session.set('status', 'on');
        return;
      }

      // This is a currently active session
      // Check `power_kw` and `session_time` (5min)
      if (status === 'on' && currentCharging !== 'done' && session.get('power_kw') < 5 && session.get('session_time') >= 300000) {
        // Send API to STOP
        return this._sendStopRequest(
          session.get('device_id'),
          session.get('outlet_number')
        ).tap((body) => {
          session.set('status', 'stopping');
          // TODO: Set `ack_id` from response
          session.set('ack_id', 3170929);
        });
      }
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
});
