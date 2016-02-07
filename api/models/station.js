const _ = require('lodash');

const BaseModel = require('./base');

module.exports = BaseModel.extend({
  urlRoot: 'stations',

  definition: function() {
    return _.assign({},
      _.result(BaseModel.prototype, 'definition'), {}
    );
  },

  setFromChargepoint(chargingStatus) {
    this.set(this._convertFromChargepoint(chargingStatus));
  },

  _convertFromChargepoint(obj) {
    const attrs = _.clone(obj);
    return attrs;
  },
});
