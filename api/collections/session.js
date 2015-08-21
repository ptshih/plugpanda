const Muni = require('muni');

const BaseCollection = require('./base');
const SessionModel = require('../models/session');

module.exports = BaseCollection.extend({
  model: SessionModel,

  /**
   * Get history of all charging sessions stored in database
   * UNUSED
   */
  _sendActivityRequest: Muni.Promise.method(() => {
    return request.send({
      url: 'https://mc.chargepoint.com/map-prod/v2?{"charging_activity":{"page_size":100},"user_id":419469}',
      headers: {
        Cookie: 'coulomb_sess=' + nconf.get('COULOMB_SESS'),
      },
    });
  }),
});
