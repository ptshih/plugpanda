// const _ = require('lodash');
const bmw = require('../lib/bmw');

const BaseController = require('./base');
const CarModel = require('../models/car');
// const CarCollection = require('../collections/car');

const authenticateBmwMiddleware = require('../middleware/authenticate_bmw');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/car'] = {
      action: this.vehicle,
      middleware: [authenticateBmwMiddleware],
    };

    this.routes.get['/car/status'] = {
      action: this.status,
      middleware: [authenticateBmwMiddleware],
    };

    this.routes.get['/car/statistics'] = {
      action: this.statistics,
      middleware: [authenticateBmwMiddleware],
    };

    this.routes.get['/car/destinations'] = {
      action: this.destinations,
      middleware: [authenticateBmwMiddleware],
    };

    this.routes.get['/car/chargingprofile'] = {
      action: this.chargingprofile,
      middleware: [authenticateBmwMiddleware],
    };

    this.routes.get['/car/rangemap'] = {
      action: this.rangemap,
      middleware: [authenticateBmwMiddleware],
    };

    this.routes.post['/car/poi'] = {
      action: this.poi,
      middleware: [authenticateBmwMiddleware],
      requiredParams: ['street', 'city', 'country'],
    };

    this.routes.post['/car/service'] = {
      action: this.service,
      middleware: [authenticateBmwMiddleware],
      requiredParams: ['type'],
    };
  },


  vehicle(req, res, next) {
    return bmw.sendVehicleRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.vehicle;
      next();
    }).catch(next);
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
      return bmw.sendStatusRequest(
        req.bmw.access_token,
        req.bmw.vin
      ).tap((data) => {
        car.setFromBMW(data.vehicleStatus);
      });
    }).tap(() => {
      return car.save();
    }).then(() => {
      res.data = car.render();
      next();
    }).catch(next);
  },

  statistics(req, res, next) {
    const filter = req.query.filter || 'allTrips';
    return bmw.sendStatisticsRequest(
      req.bmw.access_token,
      req.bmw.vin,
      filter
    ).then((data) => {
      res.data = data[filter];
      next();
    }).catch(next);
  },

  destinations(req, res, next) {
    return bmw.sendDestinationsRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.destinations;
      next();
    }).catch(next);
  },

  chargingprofile(req, res, next) {
    return bmw.sendChargingProfileRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.weeklyPlanner;
      next();
    }).catch(next);
  },

  rangemap(req, res, next) {
    return bmw.sendRangeMapRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.rangemap;
      next();
    }).catch(next);
  },

  poi(req, res, next) {
    const car = new CarModel();
    car.db = this.get('db');
    car.bmw = req.bmw;

    return bmw.sendPOIRequest(
      req.bmw.access_token,
      req.bmw.vin,
      {
        street: req.body.street,
        city: req.body.city,
        country: req.body.country,
      }
    ).tap(() => {
      res.sendStatus(204).end();
    }).catch(next);
  },

  service(req, res, next) {
    const car = new CarModel();
    car.db = this.get('db');
    car.bmw = req.bmw;

    return bmw.sendExecuteServiceRequest(
      req.bmw.access_token,
      req.bmw.vin,
      req.body.type
    ).tap((result) => {
      res.data = result.executionStatus;
      next();
    }).catch(next);
  },
});
