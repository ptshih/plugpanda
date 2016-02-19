const bmwapi = require('../lib/bmw');

module.exports = function(req, res, next) {
  if (!req.user) {
    next(new Error(`User not authenticated.`));
    return;
  }

  bmwapi.auth(req.user).tap((bmw) => {
    req.bmw = bmw;
    next();
  }).catch((err) => {
    next(new Error(`Error authenticating BMW: ${err.message}`));
  });
};
