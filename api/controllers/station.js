const _ = require('lodash');
const chargepoint = require('../lib/chargepoint');

const authenticateUserMiddleware = require('../middleware/authenticate-user');

const BaseController = require('./base');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/stations/frequent'] = {
      action: this.frequent,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.get['/stations/:station_id'] = {
      action: this.station,
      middleware: [authenticateUserMiddleware],
    };
  },

  frequent(req, res, next) {
    const query = {
      user_id: req.user.id,
      $and: [{
        address1: {
          $ne: null,
        },
      }, {
        city: {
          $ne: null,
        },
      }, {
        state_name: {
          $ne: null,
        },
      }],
    };

    const pipeline = [{
      $match: query,
    }, {
      $group: {
        _id: {
          // device_id: '$device_id',
          // lat: '$lat',
          // lon: '$lon',
          address1: '$address1',
          city: '$city',
          state_name: '$state_name',
          payment_type: '$payment_type',
        },
        count: {
          $sum: 1,
        },
      },
    }, {
      $sort: {
        count: -1,
      },
    }];

    this.get('db').aggregate('sessions', pipeline, {
      readPreference: 'secondaryPreferred',
    }).then((results) => {
      const stations = [];
      _.each(results, (station) => {
        stations.push({
          // id: station._id.device_id,
          // lat: station._id.lat,
          // lon: station._id.lon,
          address: station._id.address1,
          city: station._id.city,
          state: station._id.state_name,
          payment_type: station._id.payment_type,
          count: station.count,
        });
      });
      res.data = stations;
      return next();
    }).catch(next);
  },

  station(req, res, next) {
    return chargepoint.sendStationRequest(req.user.get('chargepoint'), req.params.station_id).then((body) => {
      res.data = body;
      next();
    }).catch(next);
  },
});
