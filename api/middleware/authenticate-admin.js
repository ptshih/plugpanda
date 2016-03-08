module.exports = function(req, res, next) {
  if (!req.user) {
    next(new Error('User not authenticated.'));
  } else if (!req.user.get('features.admin')) {
    next(new Error('User is not admin.'));
  } else {
    next();
  }
};
