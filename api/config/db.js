const Muni = require('muni');
const fs = require('fs');
const path = require('path');

module.exports = new Muni.Mongo(
  `mongodb://${nconf.get('MONGODB_USER')}:${nconf.get('MONGODB_PASSWORD')}@${nconf.get('MONGODB_URL')}`,
  {
    mongos: {
      ssl: true,
      sslValidate: true,
      sslCA: [fs.readFileSync(path.join(__dirname, 'compose.pem'))],
    },
  }
);
