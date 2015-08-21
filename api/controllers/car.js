const _ = require('lodash');
const Muni = require('muni');

const BaseController = require('./base');
const CarModel = require('../models/car');
const CarCollection = require('../collections/car');
const request = require('../lib/request');
const carMiddleware = require('../middleware/car');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/car/status'] = {
      action: this.status,
      middleware: [carMiddleware],
    };
  },

  status(req, res, next) {
    const car = new CarModel();
    car.db = this.get('db');

    return this._sendStatusRequest(req.bmw.access_token).tap((body) => {
      res.json(body);
    }).catch(next);
  },

  _sendStatusRequest: Muni.Promise.method((accessToken) => {
    return request.send({
      url: 'https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/WBY1Z4C58FV501513/status',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }),

});
