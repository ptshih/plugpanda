const request = require('./request');
const Muni = require('muni');

module.exports = {
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
  sendStatusRequest: Muni.Promise.method(function(userId) {
    return request.send({
      url: `https://mc.chargepoint.com/map-prod/v2?{"charging_status":{},"user_id":${userId}}`,
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
    }).then((data) => {
      return data.charging_status;
    });
  }),

  sendStationRequest: Muni.Promise.method(function(userId, deviceId) {
    return request.send({
      url: `https://mc.chargepoint.com/map-prod/v2?{"station_info":{"device_id":${deviceId},"include_port_status":true},"user_id":${userId}}`,
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
    }).then((data) => {
      return data.station_info;
    });
  }),

  /**
   * Send a STOP request for a station/port to Chargepoint
   */
  sendStopRequest: Muni.Promise.method(function(userId, deviceId, outletNumber) {
    console.log(`-----> Stop Request for Device: ${deviceId}, Port: ${outletNumber}.`);

    return request.send({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
      json: {
        user_id: userId,
        stop_session: {
          device_id: this.get('device_id'),
          port_number: this.get('outlet_number'),
        },
      },
    });
  }),

  /**
   * Check on the status of a STOP request
   */
  sendStopAckRequest: Muni.Promise.method(function(userId, ackId) {
    console.log(`-----> Stop ACK Request for ACK: ${ackId}.`);

    return request.send({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
      json: {
        user_id: userId,
        session_ack: {
          ack_id: ackId,
          session_action: 'stop_session',
        },
      },
    });
  }),

  /**
   * Get history of all charging sessions stored in database
   * UNUSED
   */
  _sendHistoryRequest: Muni.Promise.method(function(userId) {
    return request.send({
      url: `https://mc.chargepoint.com/map-prod/v2?{"charging_activity":{"page_size":100},"user_id":${userId}}`,
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
    });
  }),
};
