module.exports = function(req, res, next) {
  if (req.get('X-Worker-Token') !== nconf.get('WORKER_TOKEN')) {
    const err = new Error('Access Denied.');
    err.code = 403;
    next(err);
  } else {
    next();
  }
};
