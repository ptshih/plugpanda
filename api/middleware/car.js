module.exports = function(req, res, next) {
  return db.findOne('bmws', {
    _id: '55d6ce9d3f6ba1006100005d',
  }).then((bmw) => {
    req.bmw = bmw;
    return next();
  }).catch((err) => {
    console.error(`Error finding BMW: ${err.message}`);
    return next();
  });
};
