const Muni = require('muni');
const os = require('os');

module.exports = new Muni.Mongo(
  `mongodb://${nconf.get('MONGODB_USER')}:${nconf.get('MONGODB_PASSWORD')}@${nconf.get('MONGODB_URL')}`,
  {
    mongos: {
      ssl: true,
      sslValidate: true,
      sslCA: [nconf.get('MONGO_SSL_CA').replace(/\\n/g, os.EOL)],
    },
  }
);
