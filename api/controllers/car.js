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

    this.routes.post['/car/service'] = {
      action: this.service,
      middleware: [carMiddleware],
      requiredParams: ['type'],
    };
  },


  status(req, res, next) {
    const car = new CarModel();
    car.db = this.get('db');
    car.bmw = req.bmw;

    return car.fetch({
      query: {
        vin: car.bmw.vin,
      },
    }).tap(() => {
      return car.sync();
    }).tap(() => {
      return car.save();
    }).then(() => {
      res.json(car.render());
    }).catch(next);
  },

  poi(req, res, next) {
    const car = new CarModel();
    car.db = this.get('db');
    car.bmw = req.bmw;

    return car.sendPOI({
      street: req.body.street,
      city: req.body.city,
      country: req.body.country,
    }).tap(() => {
      res.sendStatus(204).end();
    }).catch(next);
  },

  service(req, res, next) {
    const car = new CarModel();
    car.db = this.get('db');
    car.bmw = req.bmw;

    return car.executeService(req.body.type).tap((result) => {
      res.json(result.executionStatus);
    }).catch(next);
  },
});
