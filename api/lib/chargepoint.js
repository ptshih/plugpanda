// const _ = require('lodash');
const request = require('../../lib/request');
const Muni = require('muni');

module.exports = {
  sendLoginRequest: Muni.Promise.method(function(email, password) {
    if (!email || !password) {
      throw new Error('Missing email or password.');
    }

    return request({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      json: {
        version: '54',
        validate_login: {
          disable_token: false,
          password: password,
          user_name: email,
        },
      },
    }).then((body) => {
      return body.validate_login;
    });
  }),

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
  sendStatusRequest: Muni.Promise.method(function(chargepoint, sessionId) {
    let sessionQuery = '';
    if (sessionId) {
      sessionQuery = `"session_id":${sessionId}`;
    }

    return request({
      url: `https://mc.chargepoint.com/map-prod/v2`,
      querystring: `{"charging_status":{${sessionQuery}},"user_id":${chargepoint.user_id}}`,
      headers: {
        Cookie: `coulomb_sess=${chargepoint.auth_token}`,
      },
    }).then((body) => {
      return body.charging_status;
    });
  }),

  sendStationRequest: Muni.Promise.method(function(chargepoint, deviceId) {
    return request({
      url: `https://mc.chargepoint.com/map-prod/v2`,
      querystring: `{"station_info":{"device_id":${deviceId},"include_port_status":true},"user_id":${chargepoint.user_id}}`,
      headers: {
        Cookie: `coulomb_sess=${chargepoint.auth_token}`,
      },
    }).then((body) => {
      return body.station_info;
    });
  }),

  /**
   * Send a STOP request for a station/port to Chargepoint
   */
  sendStopRequest: Muni.Promise.method(function(chargepoint, deviceId, outletNumber) {
    console.log(`-----> Stop Request for Device: ${deviceId}, Port: ${outletNumber}.`);

    return request({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: `coulomb_sess=${chargepoint.auth_token}`,
      },
      json: {
        version: '54',
        user_id: chargepoint.user_id,
        stop_session: {
          device_id: deviceId,
          port_number: outletNumber,
        },
      },
    }).then((body) => {
      return body.stop_session;
    });
  }),

  /**
   * Check on the status of a STOP request
   */
  sendStopAckRequest: Muni.Promise.method(function(chargepoint, ackId) {
    console.log(`-----> Stop ACK Request for ACK: ${ackId}.`);

    return request({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: `coulomb_sess=${chargepoint.auth_token}`,
      },
      json: {
        version: '54',
        user_id: chargepoint.user_id,
        session_ack: {
          ack_id: ackId,
          session_action: 'stop_session',
        },
      },
    }).then((body) => {
      return body.session_ack;
    });
  }),

  /**
   * Get history of all charging sessions stored in database
   * UNUSED
   */
  sendHistoryRequest: Muni.Promise.method(function(chargepoint) {
    return request({
      url: `https://mc.chargepoint.com/map-prod/v2`,
      querystring: `{"charging_activity":{"page_size":100},"user_id":${chargepoint.user_id}}`,
      headers: {
        Cookie: `coulomb_sess=${chargepoint.auth_token}`,
      },
    }).then((body) => {
      return body.charging_activity;
    });
  }),
};
