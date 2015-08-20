const Muni = require('muni');

// TODO: move password to ENV
module.exports = new Muni.Mongo(
  'mongodb://panda:sadpanda@candidate.49.mongolayer.com:10603,candidate.1.mongolayer.com:10742/production',
  {
    replicaSet: 'set-55d526ebad798bab6c000a34',
    readPreference: 'primary',
  }
);
