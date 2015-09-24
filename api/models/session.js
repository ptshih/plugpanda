const POWER_KW_MIN = 3.5;
const CHARGING_TIME_MIN = 300000;

const _ = require('lodash');
const Muni = require('muni');
const chargepoint = require('../lib/chargepoint');
const twilio = require('../lib/twilio');
const math = require('../../lib/math');

const BaseUserModel = require('./base_user');

module.exports = BaseUserModel.extend({
  urlRoot: 'sessions',

  defaults() {
    return _.extend({},
      _.result(BaseUserModel.prototype, 'defaults'), {
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
      _.result(BaseUserModel.prototype, 'schema'), {
        // From Chargepoint
        company_id: 'uinteger',
        session_id: 'uinteger',
        device_id: 'uinteger',
        ack_id: 'uinteger',
        outlet_number: 'uinteger',
        port_level: 'uinteger',
        payment_type: 'string', // paid, free
        // After unplugging, `current_charging` will become `done`
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

  render() {
    const json = BaseUserModel.prototype.render.apply(this, arguments);
    json.average_power = this._calculateAveragePower(json.update_data);
    return json;
  },


  startSession() {
    console.log(`-----> Starting Session: ${this.get('session_id')}.`);
    this.set('status', 'on');
    return this;
  },

  endSession() {
    console.log(`-----> Ending Session: ${this.get('session_id')}.`);
    this.set('status', 'off');
    return this;
  },

  /**
   * Send a STOP request to Chargepoint
   * Send SMS notification via Twilio (optional)
   */
  stopSession() {
    console.log(`-----> Stopping Session: ${this.get('session_id')}.`);

    const sessionId = this.get('session_id');
    const deviceId = this.get('device_id');
    const outletNumber = this.get('outlet_number');

    // Send a stop request to Chargepoint
    return chargepoint.sendStopRequest(
      this.user.get('chargepoint'),
      deviceId,
      outletNumber
    ).then((stopSession) => {
      console.log(`-----> Stop session succeeded with ack: ${stopSession.ack_id}.`);

      // Save `ack_id` from Chargepoint
      // This is used to monitor the status of a stop request
      this.set('status', 'stopping');
      this.set('ack_id', stopSession.ack_id);

      // Send SMS notification via Twilio
      const phoneCode = this.user.phoneCode();
      const phoneNumber = this.user.get('phone');

      if (!phoneCode || !phoneNumber) {
        console.log('-----> No phone number.');
        return this;
      }

      return twilio.sendNotification({
        to: `${phoneCode}${phoneNumber}`,
        body: `Stopped: ${sessionId} for device: ${deviceId} on port: ${outletNumber}`,
      }).return(this);
    }).catch((err) => {
      console.error(`-----> Session: ${sessionId} failed to stop: ${err.message}.`);
      throw err;
    });
  },

  /**
   * Check out the status of a STOP request to Chargepoint
   * CURRENTLY UNUSED
   */
  stopSessionAck() {
    const sessionId = this.get('session_id');

    return chargepoint.sendStopAckRequest(this.user.get('chargepoint'), this.get('ack_id')).then((sessionAck) => {
      // TODO: update `ack_id` from `sessionAck`
      console.log(sessionAck);
      return this;
    }).catch((err) => {
      console.error(`-----> Session: ${sessionId} failed to ack: ${err.message}.`);
      throw err;
    });
  },

  /**
   * Update a session based on a status request from Chargepoint
   * This holds all of the LOGIC for handling session state
   */
  saveFromChargepoint(chargingStatus) {
    return Muni.Promise.bind(this).tap(() => {
      this.set(this._convertFromChargepoint(chargingStatus));
    }).then(() => {
      // Session Status
      const sessionId = this.get('session_id');
      const status = this.get('status');
      const currentCharging = this.get('current_charging');

      // This session is done and unplugged
      // Turn off the session permanently
      if (currentCharging === 'done') {
        if (status === 'off') {
          console.log(`-----> Session: ${sessionId} is done.`);
          return false;
        }

        // For all other `status`, end the session
        this.endSession();
        return true;
      }

      // This session is warming up and plugged in
      if (currentCharging === 'not_charging') {
        // For all `status`
        console.log(`-----> Session: ${sessionId} is not charging.`);
        return true;
      }

      // The session is actively charging and plugged in
      if (currentCharging === 'in_use') {
        // This session has already been stopped
        if (status === 'stopping') {
          console.log(`-----> Session: ${sessionId} is stopped.`);
          return false;
        }

        // This session was off or was starting
        if (status === 'off' || status === 'starting') {
          this.startSession();
          return true;
        }

        // For all other `status`, stop the session if necessary
        if (this._shouldStopSession()) {
          // This session is tapering and is almost done charging
          // Charging rate has dropped below `POWER_KW_MIN`
          // And has been charging at least `CHARGING_TIME_MIN`
          return this.stopSession().then(() => {
            // Successfully stopped session
            return true;
          }).catch(() => {
            // Ignore errors
            return true;
          });
        }

        // This session is charging above the minimum rate
        console.log(`-----> Session: ${sessionId} is actively charging.`);
        return true;
      }

      // This session is fully charged and plugged in
      if (currentCharging === 'fully_charged') {
        // This session has already been stopped
        if (status === 'stopping') {
          console.log(`-----> Session: ${sessionId} is stopped.`);
          return false;
        }

        // For all other `status`, stop the session
        return this.stopSession().then(() => {
          // Successfully stopped session
          return true;
        }).catch(() => {
          // Ignore errors
          return true;
        });
      }

      // Unknown `current_charging`
      console.log(`-----> Session: ${sessionId} has unknown charging status: ${currentCharging}.`);
      return false;
    }).tap((shouldSave) => {
      // Save Session
      if (shouldSave) {
        return this.save();
      }
    }).return(this);
  },


  /**
   * Whitelisted properties to extract from Chargepoint API
   * Some properties don't exist when `current_charging` is `done` (not active)
   */
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

  /**
   * Compute the average power (kw) by iterating over `update_data`
   * This is because `power_kw` from Chargepoint is real-time
   */
  _calculateAveragePower(updateData) {
    if (!updateData.length) {
      return 0;
    }

    const totalPower = _.reduce(updateData, (total, dataPoint) => {
      return total + dataPoint.power_kw;
    }, 0);
    const totalPoints = _.reduce(updateData, (total, dataPoint) => {
      if (dataPoint.power_kw === 0) {
        return total;
      }
      return total + 1;
    }, 0);

    return math.round(totalPower / totalPoints, 3);
  },

  /**
   * Logic to determine when to STOP a session
   * Only stops sessions that are `paid`
   * Must have `power_kw > 0` so it's not warming up
   * Must have at least charged for `CHARGING_TIME_MIN` milliseconds
   * Must maintain at least `POWER_KW_MIN` power level during last update
   */
  _shouldStopSession() {
    return this.get('payment_type') === 'paid' &&
      this.get('power_kw') > 0 &&
      this.get('power_kw') < POWER_KW_MIN &&
      this.get('charging_time') > CHARGING_TIME_MIN;
  },
});
