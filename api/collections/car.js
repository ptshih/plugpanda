const BaseCollection = require('./base');
const CarModel = require('../models/car');

module.exports = BaseCollection.extend({
  model: CarModel,
});
