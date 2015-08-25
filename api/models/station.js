const _ = require('lodash');

const BaseModel = require('./base');

module.exports = BaseModel.extend({
  urlRoot: 'stations',

  defaults() {
    return _.extend({},
      _.result(BaseModel.prototype, 'defaults'), {
        // From Chargepoint

      }
    );
  },

  schema() {
    return _.extend({},
      _.result(BaseModel.prototype, 'schema'), {
        // From Chargepoint

      }
    );
  },

  setFromChargepoint(chargingStatus) {
    this.set(this._convertFromChargepoint(chargingStatus));
  },

  _convertFromChargepoint(obj) {
    const attrs = {

    };

    return attrs;
  },
});
