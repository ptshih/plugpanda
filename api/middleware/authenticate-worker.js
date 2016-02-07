module.exports = function(req, res, next) {
  if (req.get('X-Panda-Worker-Token') !== nconf.get('WORKER_TOKEN')) {
    const err = new Error('Access Denied.');
    err.code = 403;
    return next(err);
  }

  return next();
};
