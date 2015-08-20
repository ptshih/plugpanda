const _ = require('lodash');
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
        payment_type: null, // paid, free
        current_charging: null, // done
        charging_time: 0,
        session_time: 0,
        start_time: 0,
        end_time: 0,
        energy_kwh: 0.0,
        power_kw: 0.0,
        miles_added: 0.0,
        total_amount: 0.0,

        // Session Status
        status: 'off',
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
        current_charging: 'string', // done
        charging_time: 'uinteger',
        session_time: 'uinteger',
        start_time: 'timestamp',
        end_time: 'timestamp',
        energy_kwh: 'ufloat',
        power_kw: 'ufloat',
        miles_added: 'ufloat',
        total_amount: 'ufloat',

        // Session Status
        status: 'string', // on, off, stopping

      }
    );
  },

  setFromChargepoint(chargingStatus) {
    this.set(this._convertFromChargepoint(chargingStatus));
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
    };
    return attrs;
  },
});
