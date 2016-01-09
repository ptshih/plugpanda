const BaseCollection = require('./base');
const UserModel = require('../models/user');

module.exports = BaseCollection.extend({
  model: UserModel,
});
