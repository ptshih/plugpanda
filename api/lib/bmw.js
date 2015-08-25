const _ = require('lodash');
const request = require('./request');
const Muni = require('muni');

module.exports = {
  auth: Muni.Promise.method((_id = '55d6ce9d3f6ba1006100005d') => {
    return db.findOne('bmws', {
      _id: _id,
    }).then((bmw) => {
      const nowTime = new Date().getTime();

      // Token is not expired, reuse it
      if (bmw.expires_at > nowTime) {
        return bmw;
      }

      // Token is expired, refresh it
      return request.send({
        method: 'POST',
        url: 'https://b2vapi.bmwgroup.us/webapi/oauth/token',
        headers: {
          Authorization: `Basic ${nconf.get('BMW_BASIC_AUTH')}`,
        },
        form: {
          grant_type: 'refresh_token',
          refresh_token: bmw.refresh_token,
          scope: 'remote_services vehicle_data',
        },
      }).then((data) => {
        // Update `expires_at` using `expires_in` (minus 5 minutes)
        data.expires_at = nowTime + (data.expires_in * 1000) - 300000;

        // Update db with new auth data
        return db.findAndModify('bmws', {
          _id: '55d6ce9d3f6ba1006100005d',
        }, {
          $set: data,
        });
      });
    });
  }),

  /**
   * Check the status of the car
   */
  sendStatusRequest: Muni.Promise.method(function(accessToken, vin) {
    return request.send({
      url: `https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/${vin}/status`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }),

  /**
   * Execute a remote service on the car
   *
   * type:
   * - DOOR_LOCK
   * - ???
   */
  sendExecuteServiceRequest: Muni.Promise.method(function(accessToken, vin, type) {
    if (!type) {
      throw new Error('Missing `type`.');
    }

    return request.send({
      method: 'POST',
      url: `https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/${vin}/executeService`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      form: {
        serviceType: type,
      },
    });
  }),


  /**
   * Send POI to car
   *
   * Properties:
   * - street
   * - city
   * - country
   * - lon (optional)
   * - lat (optional)
   * - name (optional)
   * - subject (optional)
   */
  sendPOIRequest: Muni.Promise.method(function(accessToken, vin, poi) {
    if (!poi.street || !poi.city || !poi.country) {
      throw new Error('Missing `street`, `city`, or `country`.');
    }

    const data = {
      poi: _.defaults(poi, {
        // subject: 'SID_MYBMW_MAP_DROPPED_PIN_TITLE',
        useAsDestination: true,
        name: poi.street,
      }),
    };

    return request.send({
      method: 'POST',
      url: `https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/${vin}/sendpoi`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      form: {
        data: JSON.stringify(data),
      },
    });
  }),


};
