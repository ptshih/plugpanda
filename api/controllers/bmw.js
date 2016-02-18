// const _ = require('lodash');
const bmwApi = require('../lib/bmw');

const BaseController = require('./base');
const BmwModel = require('../models/bmw');

const authenticateUserMiddleware = require('../middleware/authenticate-user');
const authenticateBmwMiddleware = require('../middleware/authenticate-bmw');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/bmw'] = {
      action: this.vehicle,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/bmw/status'] = {
      action: this.status,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/bmw/statistics'] = {
      action: this.statistics,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/bmw/destinations'] = {
      action: this.destinations,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/bmw/chargingprofile'] = {
      action: this.chargingprofile,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.get['/bmw/rangemap'] = {
      action: this.rangemap,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
    };

    this.routes.post['/bmw/poi'] = {
      action: this.poi,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
      requiredParams: ['street', 'city', 'country'],
    };

    this.routes.post['/bmw/service'] = {
      action: this.service,
      middleware: [authenticateUserMiddleware, authenticateBmwMiddleware],
      requiredParams: ['type'],
    };
  },


  vehicle(req, res, next) {
    return bmwApi.sendVehicleRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.vehicle;
      next();
    }).catch(next);
  },

  status(req, res, next) {
    const bmw = new BmwModel();
    bmw.db = this.get('db');

    return bmw.fetch({
      query: {
        vin: req.bmw.vin,
      },
    }).tap(() => {
      return bmwApi.sendStatusRequest(
        req.bmw.access_token,
        req.bmw.vin
      ).tap((data) => {
        bmw.setFromBmw(data.vehicleStatus);
      });
    }).tap(() => {
      return bmw.save();
    }).then(() => {
      res.data = bmw.render();
      next();
    }).catch(next);
  },

  statistics(req, res, next) {
    const filter = req.query.filter || 'allTrips';
    return bmwApi.sendStatisticsRequest(
      req.bmw.access_token,
      req.bmw.vin,
      filter
    ).then((data) => {
      res.data = data[filter];
      next();
    }).catch(next);
  },

  destinations(req, res, next) {
    return bmwApi.sendDestinationsRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.destinations;
      next();
    }).catch(next);
  },

  chargingprofile(req, res, next) {
    return bmwApi.sendChargingProfileRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.weeklyPlanner;
      next();
    }).catch(next);
  },

  rangemap(req, res, next) {
    return bmwApi.sendRangeMapRequest(
      req.bmw.access_token,
      req.bmw.vin
    ).then((data) => {
      res.data = data.rangemap;
      next();
    }).catch(next);
  },

  poi(req, res, next) {
    return bmwApi.sendPOIRequest(
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
    return bmwApi.sendExecuteServiceRequest(
      req.bmw.access_token,
      req.bmw.vin,
      req.body.type
    ).tap((result) => {
      res.data = result.executionStatus;
      next();
    }).catch(next);
  },
});
