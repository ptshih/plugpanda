const _ = require('lodash');
const BaseModel = require('./base');

module.exports = BaseModel.extend({
  urlRoot: 'cars',

  defaults() {
    return _.extend({},
      _.result(BaseModel.prototype, 'defaults'), {

      }
    );
  },

  schema() {
    return _.extend({},
      _.result(BaseModel.prototype, 'schema'), {

      }
    );
  },
});
