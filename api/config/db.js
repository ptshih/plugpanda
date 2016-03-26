const Muni = require('muni');

module.exports = new Muni.Mongo(
  `mongodb://${nconf.get('MONGODB_USER')}:${nconf.get('MONGODB_PASSWORD')}@${nconf.get('MONGODB_URL')}`
);
