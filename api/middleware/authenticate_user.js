const UserModel = require('../models/user');

module.exports = function(req, res, next) {
  const user = new UserModel();
  user.db = db; // global
  return user.fetch({
    query: {
      access_token: '4d0b29f175ef1fa1d21e6302e9957cf614c24874cdee01d1b9149db5aeccec3273e7f34e455cdb76de502efb0feb5153',
    },
    require: true,
  }).then(function() {
    // Authenticated
    req.user = user;

    return next();
  }).catch((err) => {
    return next(new Error(`Error authenticating User: ${err.message}`));
  });
};
