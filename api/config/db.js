const Muni = require('muni');
const fs = require('fs');
const path = require('path');

module.exports = new Muni.Mongo(
  `mongodb://${nconf.get('PANDA_MONGODB_USER')}:${nconf.get('PANDA_MONGODB_PASSWORD')}@aws-us-east-1-portal.4.dblayer.com:11115/production`,
  {
    mongos: {
      ssl: true,
      sslValidate: true,
      sslCA: [fs.readFileSync(path.join(__dirname, 'compose.pem'))],
    },
  }
);
