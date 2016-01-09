const Muni = require('muni');

module.exports = new Muni.Mongo(
  `mongodb://${nconf.get('PANDA_MONGODB_USER')}:${nconf.get('PANDA_MONGODB_PASSWORD')}@candidate.49.mongolayer.com:10603,candidate.1.mongolayer.com:10742/production`,
  {
    replicaSet: 'set-55d526ebad798bab6c000a34',
    readPreference: 'primary',
  }
);
