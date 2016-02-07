// const _ = require('lodash');
const bmwapi = require('../lib/bmw');

const BaseController = require('./base');
const CarModel = require('../models/car');
// const CarCollection = require('../collections/car');

const authenticateUserMiddleware = require('../middleware/authenticate-user');
const authenticateBmwMiddleware = require('../middleware/authenticate-bmw');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/car'] = {
      action: this.vehicle,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/car/status'] = {
      action: this.status,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/car/statistics'] = {
      action: this.statistics,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/car/destinations'] = {
      action: this.destinations,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/car/chargingprofile'] = {
      action: this.chargingprofile,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/car/rangemap'] = {
      action: this.rangemap,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.post['/car/poi'] = {
      action: this.poi,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
      requiredParams: ['street', 'city', 'country'],
    };

    this.routes.post['/car/service'] = {
      action: this.service,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
      requiredParams: ['type'],
    };
  },


  vehicle(req, res, next) {
    return bmwapi.sendVehicleRequest(
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

    return car.fetch({
      query: {
        vin: req.bmw.vin,
      },
    }).tap(() => {
      return bmwapi.sendStatusRequest(
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
    return bmwapi.sendStatisticsRequest(
      req.bmw.access_token,
      req.bmw.vin,
      filter
    ).then((data) => {
      res.data = data[filter];
      next();
    }).catch(next);
  },

  destinations(req, res, next) {
    return bmwapi.sendDestinationsRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.destinations;
      next();
    }).catch(next);
  },

  chargingprofile(req, res, next) {
    return bmwapi.sendChargingProfileRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.weeklyPlanner;
      next();
    }).catch(next);
  },

  rangemap(req, res, next) {
    return bmwapi.sendRangeMapRequest(
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

    return bmwapi.sendPOIRequest(
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

    return bmwapi.sendExecuteServiceRequest(
      req.bmw.access_token,
      req.bmw.vin,
      req.body.type
    ).tap((result) => {
      res.data = result.executionStatus;
      next();
    }).catch(next);
  },
});
