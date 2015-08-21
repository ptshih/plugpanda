const request = require('../lib/request');

module.exports = function(req, res, next) {
  return db.findOne('bmws', {
    _id: '55d6ce9d3f6ba1006100005d',
  }).then((bmw) => {
    const nowDate = new Date();
    const nowTime = nowDate.getTime();

    // Token is not expired
    if (bmw.expires_at > nowTime) {
      return bmw;
    }

    // Token is expired, refresh it
    return request.send({
      method: 'POST',
      url: 'https://b2vapi.bmwgroup.us/webapi/oauth/token',
      headers: {
        Authorization: `Basic ${nconf.get('BMW_BASIC_AUTH')}`,
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: bmw.refresh_token,
        scope: 'remote_services vehicle_data',
      },
    }).then((data) => {
      data.expires_at = nowTime + (data.expires_in * 1000);
      return db.findAndModify('bmws', {
        _id: '55d6ce9d3f6ba1006100005d',
      }, data);
    });
  }).then((bmw) => {
    req.bmw = bmw;
    return next();
  }).catch((err) => {
    console.error(`Error finding BMW: ${err.message}`);
    return next();
  });
};
