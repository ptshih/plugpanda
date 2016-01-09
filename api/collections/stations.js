const BaseCollection = require('./base');
const StationModel = require('../models/station');

module.exports = BaseCollection.extend({
  model: StationModel,

  // TODO: Fetch all nearby stations

});
