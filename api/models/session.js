const POWER_KW_MIN = 5;
const CHARGING_TIME_MIN = 300000;

const _ = require('lodash');
const chargepoint = require('../lib/chargepoint');
const twilio = require('../lib/twilio');

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
        current_charging: 'string', // not_charging, in_use, done, fully_charged
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

  shouldStopSession() {
    return this.get('payment_type') === 'paid' &&
      this.get('power_kw') > 0 &&
      this.get('power_kw') < POWER_KW_MIN &&
      this.get('charging_time') > CHARGING_TIME_MIN;
  },

  /**
   * Send stop request to Chargepoint
   * Send SMS notification via Twilio
   */
  stopSession(userId) {
    const sessionId = this.get('session_id');
    const deviceId = this.get('device_id');
    const outletNumber = this.get('outlet_number');

    // Send a stop request to Chargepoint
    return chargepoint.sendStopRequest(
      userId,
      deviceId,
      outletNumber
    ).tap((body) => {
      if (!body.stop_session) {
        throw new Error(`Invalid response from Chargepoint.`);
      }

      if (!body.stop_session.status) {
        throw new Error(`Stop session failed with error: ${body.stop_session.error}.`);
      }

      // Stop the session
      this.set('status', 'stopping');

      // Save `ack_id` from Chargepoint
      // This is used to monitor the status of a stop request
      this.set('ack_id', body.stop_session.ack_id);
    }).tap(() => {
      // Send SMS notification via Twilio
      return twilio.sendNotification({
        body: `Stopped: ${sessionId} for device: ${deviceId} on port: ${outletNumber}`,
      }).tap((body) => {
        console.log(`-----> Stop notification sent: ${body.sid}.`);
      });
    });
  },

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
      vehicle_info: obj.vehicle_info,
    };

    // Only when charging is active
    if (obj.update_data) {
      attrs.update_data = obj.update_data;
    }

    // Only when charging is active
    if (obj.enable_stop_charging) {
      attrs.enable_stop_charging = obj.enable_stop_charging;
    }

    return attrs;
  },
});
