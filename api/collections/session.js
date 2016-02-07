const BaseCollection = require('./base');
const SessionModel = require('../models/session');

module.exports = BaseCollection.extend({
  model: SessionModel,
});
