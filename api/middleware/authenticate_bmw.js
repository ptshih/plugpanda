const bmwapi = require('../lib/bmw');

module.exports = function(req, res, next) {
  if (!req.user) {
    return next(new Error(`Error authenticating User for BMW: ${err.message}`));
  }
  return bmwapi.auth(req.user).then((bmw) => {
    req.bmw = bmw;
    return next();
  }).catch((err) => {
    return next(new Error(`Error authenticating BMW: ${err.message}`));
  });
};
