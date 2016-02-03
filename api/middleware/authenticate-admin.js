module.exports = function(req, res, next) {
  if (!req.user) {
    return next(new Error(`User not authenticated.`));
  }

  if (!req.user.get('features.admin')) {
    return next(new Error(`User is not admin.`));
  }

  return next();
};
