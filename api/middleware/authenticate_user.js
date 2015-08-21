module.exports = function(req, res, next) {
  // TODO: currently hardcoded
  req.user_id = 419469;

  return next();
};
