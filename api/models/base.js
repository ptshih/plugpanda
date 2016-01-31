const _ = require('lodash');
const Muni = require('muni');

module.exports = Muni.Model.extend({
  definition: function() {
    return {
      _id: {
        type: 'id',
      },
      created: {
        type: 'timestamp',
      },
      updated: {
        type: 'timestamp',
      },
      created_date: {
        type: 'date',
      },
      updated_date: {
        type: 'date',
      },
    };
  },

  setFromRequest: Muni.Promise.method(function setFromRequest(body) {
    const keys = _.union(_.keys(_.result(this, 'readOnlyAttributes')), [
      '_id',
      'created',
      'created_date',
      'updated',
      'updated_date',
    ]);
    return Muni.Model.prototype.setFromRequest.call(this, _.omit(body, keys));
  }),

  beforeSave: Muni.Promise.method(function beforeSave() {
    const nowDate = new Date();

    // Automatically set updated/updated_date on save
    _.assign(this.attributes, {
      updated: nowDate.getTime(),
      updated_date: nowDate,
    });

    return Muni.Model.prototype.beforeSave.apply(this, arguments);
  }),
});
