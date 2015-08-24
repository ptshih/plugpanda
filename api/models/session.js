const _ = require('lodash');
const Muni = require('muni');
const request = require('../lib/request');

// Twilio
const twilioClient = require('twilio')(
  nconf.get('TWILIO_ACCOUNT_SID'),
  nconf.get('TWILIO_AUTH_TOKEN')
);
Muni.Promise.promisifyAll(twilioClient);

const BaseModel = require('./base');

module.exports = BaseModel.extend({
  urlRoot: 'sessions',

  defaults() {
    return _.extend({},
      _.result(BaseModel.prototype, 'defaults'), {
        // From Chargepoint
        company_id: 0,
        session_id: 0,
        device_id: 0,
        ack_id: 0,
        outlet_number: 0,
        port_level: 0,
        payment_type: null,
        current_charging: null,
        charging_time: 0,
        session_time: 0,
        start_time: 0,
        end_time: 0,
        energy_kwh: 0.0,
        power_kw: 0.0,
        miles_added: 0.0,
        total_amount: 0.0,
        lat: 0,
        lon: 0,
        company_name: null,
        address1: null,
        state_name: null,
        city: null,
        currency_iso_code: 'USD',
        enable_stop_charging: true,
        update_data: [],
        vehicle_info: {},

        // Session Status
        status: 'starting',
      }
    );
  },

  schema() {
    return _.extend({},
      _.result(BaseModel.prototype, 'schema'), {
        // From Chargepoint
        company_id: 'uinteger',
        session_id: 'uinteger',
        device_id: 'uinteger',
        ack_id: 'uinteger',
        outlet_number: 'uinteger',
        port_level: 'uinteger',
        payment_type: 'string', // paid, free
        current_charging: 'string', // not_charging, in_use, done
        charging_time: 'uinteger',
        session_time: 'uinteger',
        start_time: 'timestamp',
        end_time: 'timestamp',
        energy_kwh: 'ufloat',
        power_kw: 'ufloat',
        miles_added: 'ufloat',
        total_amount: 'ufloat',
        lat: 'float',
        lon: 'float',
        company_name: 'string',
        address1: 'string',
        state_name: 'string',
        city: 'string',
        currency_iso_code: 'string',
        enable_stop_charging: 'boolean',
        update_data: [],
        vehicle_info: {},

        // Session Status
        status: 'string', // starting, on, stopping, off
      }
    );
  },


  setFromChargepoint(chargingStatus) {
    this.set(this._convertFromChargepoint(chargingStatus));
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
  sendStatusRequest: Muni.Promise.method(function() {
    return request.send({
      url: `https://mc.chargepoint.com/map-prod/v2?{"charging_status":{},"user_id":${this.user_id}}`,
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
    }).then((data) => {
      return data.charging_status;
    });
  }),

  /**
   * Send a STOP request for a station/port to Chargepoint
   */
  sendStopRequest: Muni.Promise.method(function() {
    console.log(`-----> Stop Request for Device: ${this.get('device_id')}, Port: ${this.get('outlet_number')}.`);

    return request.send({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
      json: {
        user_id: this.user_id,
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
  sendStopAckRequest: Muni.Promise.method(function() {
    console.log(`-----> Stop ACK Request for ACK: ${this.get('ack_id')}, Device: ${this.get('device_id')}, Port: ${this.get('outlet_number')}.`);

    return request.send({
      method: 'POST',
      url: 'https://webservices.chargepoint.com/backend.php/mobileapi',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
      json: {
        user_id: this.user_id,
        session_ack: {
          ack_id: this.get('ack_id'),
          session_action: 'stop_session',
        },
      },
    });
  }),

  /**
   * Send SMS via Twilio
   */
  sendNotification: Muni.Promise.method(function(options) {
    options.to = options.to || '+18085183808';
    options.from = options.from || '+14158861337';

    if (!_.isString(options.body)) {
      throw new Error('Missing Notification Text.');
    }

    return twilioClient.sendMessage(options);
  }),


  _convertFromChargepoint(obj) {
    const attrs = {
      company_id: obj.company_id,
      session_id: obj.session_id,
      device_id: obj.device_id,
      outlet_number: obj.outlet_number,
      port_level: obj.port_level,
      payment_type: obj.payment_type,
      current_charging: obj.current_charging,
      charging_time: obj.charging_time,
      session_time: obj.session_time,
      start_time: obj.start_time,
      end_time: obj.end_time,
      energy_kwh: obj.energy_kwh,
      power_kw: obj.power_kw,
      miles_added: obj.miles_added,
      total_amount: obj.total_amount,
      lat: obj.lat,
      lon: obj.lon,
      company_name: obj.company_name,
      address1: obj.address1,
      state_name: obj.state_name,
      city: obj.city,
      currency_iso_code: obj.currency_iso_code,
      enable_stop_charging: obj.enable_stop_charging,
    };

    // Only when charging is active
    if (obj.update_data) {
      attrs.update_data = obj.update_data;
    }

    // Optional vehicle info
    if (obj.vehicle_info) {
      attrs.vehicle_info = obj.vehicle_info;
    }

    return attrs;
  },
});
