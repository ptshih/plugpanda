const _ = require('lodash');
const Muni = require('muni');

module.exports = Muni.Model.extend({
  defaults() {
    const nowDate = new Date();
    const nowTime = nowDate.getTime();
    return {
      _id: null,
      created: nowTime, // ms
      updated: nowTime, // ms
      created_date: nowDate, // iso
      updated_date: nowDate, // iso
    };
  },

  schema() {
    return {
      _id: 'id',
      created: 'timestamp',
      updated: 'timestamp',
      created_date: 'date',
      updated_date: 'date',
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
    _.extend(this.attributes, {
      updated: nowDate.getTime(),
      updated_date: nowDate,
    });

    return Muni.Model.prototype.beforeSave.apply(this, arguments);
  }),
});
