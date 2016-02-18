const BaseCollection = require('./base');
const BmwModel = require('../models/bmw');

module.exports = BaseCollection.extend({
  model: BmwModel,
});
