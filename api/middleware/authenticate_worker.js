module.exports = function(req, res, next) {
  console.log(nconf.get('PANDA_WORKER_TOKEN'))
  if (req.get('X-Panda-Worker-Token') !== nconf.get('PANDA_WORKER_TOKEN')) {
    const err = new Error('Access Denied.');
    err.code = 403;
    return next(err);
  }

  return next();
};
