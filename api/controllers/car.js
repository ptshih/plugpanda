const _ = require('lodash');
const Muni = require('muni');

const BaseController = require('./base');
const CarModel = require('../models/car');
// const CarCollection = require('../collections/car');
const request = require('../lib/request');
const carMiddleware = require('../middleware/car');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/car/status'] = {
      action: this.status,
      middleware: [carMiddleware],
    };

    this.routes.post['/car/poi'] = {
      action: this.poi,
      middleware: [carMiddleware],
      requiredParams: ['street', 'city', 'country'],
    };
  },

  status(req, res, next) {
    const car = new CarModel();
    car.db = this.get('db');

    return car.fetch({
      query: {
        vin: req.bmw.vin,
      },
    }).tap(() => {
      return this._sendStatusRequest(req.bmw).tap((data) => {
        car.setFromBMW(data.vehicleStatus);
      });
    }).tap(() => {
      return car.save();
    }).then(() => {
      res.json(car.render());
    }).catch(next);
  },

  poi(req, res, next) {
    return this._sendPOIRequest(req.bmw, {
      street: req.body.street,
      city: req.body.city,
      country: req.body.country,
    }).tap(() => {
      res.sendStatus(204).end();
    }).catch(next);
  },


  _sendStatusRequest: Muni.Promise.method((bmw) => {
    return request.send({
      url: `https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/${bmw.vin}/status`,
      headers: {
        Authorization: `Bearer ${bmw.access_token}`,
      },
    });
  }),

  /**
   * Send POI to car
   *
   * Properties:
   * - street
   * - city
   * - country
   * - lon (optional)
   * - lat (optional)
   * - name (optional)
   * - subject (optional)
   */
  _sendPOIRequest: Muni.Promise.method((bmw, poi) => {
    if (!poi.street || !poi.city || !poi.country) {
      throw new Error('Missing `street`, `city`, or `country`.');
    }

    const data = {
      poi: _.defaults(poi, {
        // subject: 'SID_MYBMW_MAP_DROPPED_PIN_TITLE',
        useAsDestination: true,
        name: poi.street,
      }),
    };

    return request.send({
      method: 'POST',
      url: `https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/${bmw.vin}/sendpoi`,
      headers: {
        Authorization: `Bearer ${bmw.access_token}`,
      },
      form: {
        data: JSON.stringify(data),
      },
    });
  }),

});
