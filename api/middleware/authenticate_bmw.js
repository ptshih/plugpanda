const bmwapi = require('../lib/bmw');

module.exports = function(req, res, next) {
  return bmwapi.auth().then((bmw) => {
    req.bmw = bmw;
    return next();
  }).catch((err) => {
    console.error(`Error authenticating BMW: ${err.message}`);
    return next();
  });
};
