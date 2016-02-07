// const _ = require('lodash');
const chargepoint = require('../lib/chargepoint');

const authenticateUserMiddleware = require('../middleware/authenticate-user');

const BaseController = require('./base');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/stations/:station_id'] = {
      action: this.station,
      middleware: [authenticateUserMiddleware],
    };
  },


  station(req, res, next) {
    return chargepoint.sendStationRequest(req.user.get('chargepoint'), req.params.station_id).then((body) => {
      res.data = body;
      next();
    }).catch(next);
  },
});
