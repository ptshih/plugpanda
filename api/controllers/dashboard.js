const _ = require('lodash');
const Muni = require('muni');

const authenticateUserMiddleware = require('../middleware/authenticate-user');

const BaseController = require('./base');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/dashboard'] = {
      action: this.dashboard,
      middleware: [authenticateUserMiddleware],
    };
  },

  dashboard(req, res, next) {
    const promises = [];
    promises.push(this._getActiveSession(req.user.id));
    promises.push(this._getFrequentStations(req.user.id));

    Muni.Promise.all(promises).tap((results) => {
      res.data = {
        active_session: results[0],
        frequent_stations: results[1],
      };
      next();
    }).catch(next);
  },

  _getActiveSession(userId) {
    const query = {
      user_id: userId,
      status: {
        $ne: 'off',
      },
    };

    return this.get('db').findOne('sessions', query, {
      sort: [['created_date', 'desc']],
    }).then((session) => {
      return session || {};
    });
  },

  _getFrequentStations(userId) {
    const query = {
      user_id: userId,
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

    return this.get('db').aggregate('sessions', pipeline, {
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

      return stations;
    });
  },
});
