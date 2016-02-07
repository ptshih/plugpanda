const _ = require('lodash');
const Muni = require('muni');
const moment = require('moment');
const chargepoint = require('../lib/chargepoint');

const authenticateUserMiddleware = require('../middleware/authenticate-user');

const BaseController = require('./base');
const SessionModel = require('../models/session');
const SessionCollection = require('../collections/session');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.get['/session/status'] = {
      action: this.status,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.get['/session/outdated'] = {
      action: this.outdated,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.get['/sessions'] = {
      action: this.history,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.get['/sessions/:session_id'] = {
      action: this.session,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.post['/sessions/:session_id/stop'] = {
      action: this.stop,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.post['/sessions/:session_id/stop_ack'] = {
      action: this.stopAck,
      middleware: [authenticateUserMiddleware],
    };
  },


  status(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');

    return chargepoint.sendStatusRequest(req.user.get('chargepoint')).tap((chargingStatus) => {
      // Fetch from DB
      return session.fetch({
        query: {
          session_id: chargingStatus.session_id,
        },
      });
    }).tap((chargingStatus) => {
      // Set `user_id` if new session
      if (!session.get('user_id')) {
        session.set('user_id', req.user.id);
      }

      // Update from Chargepoint
      return session.saveFromChargepoint(chargingStatus);
    }).then(() => {
      res.data = session.render();
      next();
    }).catch(next);
  },

  session(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');

    const query = {};
    if (req.params.session_id && req.params.session_id !== 'current') {
      query.session_id = _.parseInt(req.params.session_id);
    }

    return session.fetch({
      query: query,
      require: true,
      sort: [['created_date', 'desc']],
    }).tap(() => {
      if (session.get('status') === 'off') {
        return session;
      }

      return chargepoint.sendStatusRequest(req.user.get('chargepoint'), query.session_id).then((chargingStatus) => {
        // Update from Chargepoint
        return session.saveFromChargepoint(chargingStatus);
      });
    }).then(() => {
      res.data = session.render();
      next();
    }).catch(next);
  },

  history(req, res, next) {
    const qo = this.parseQueryString(req, {
      queryParams: {
        status: 'string',
        current_charging: 'string',
        payment_type: 'string',
        device_id: 'integer',
      },
      sortParam: 'created_date',
      sortOrder: 'desc',
    });

    // Omit `update_data` and `vehicle_info`
    qo.fields = {
      user_id: 1,
      created_date: 1,
      updated_date: 1,

      ack_id: 1,
      address1: 1,
      average_power: 1,
      charging_time: 1,
      city: 1,
      company_id: 1,
      company_name: 1,
      currency_iso_code: 1,
      current_charging: 1,
      device_id: 1,
      enable_stop_charging: 1,
      energy_kwh: 1,
      lat: 1,
      lon: 1,
      miles_added: 1,
      outlet_number: 1,
      payment_type: 1,
      port_level: 1,
      power_kw: 1,
      session_id: 1,
      session_time: 1,
      state_name: 1,
      status: 1,
      total_amount: 1,
    };

    const sessions = new SessionCollection();
    sessions.db = this.get('db');

    return sessions.fetch(qo).tap(() => {
      res.data = sessions.render();
      next();
    }).catch(next);
  },

  outdated(req, res, next) {
    const sessions = new SessionCollection();
    sessions.db = this.get('db');

    return sessions.fetch({
      query: {
        status: 'on',
        updated_date: {
          $lt: moment().subtract(15, 'minutes').toDate(), // 15 minutes
        },
      },
    }).tap(() => {
      if (!sessions.length) {
        res.data = [];
        return next();
      }

      const promises = [];
      sessions.each((session) => {
        promises.push(chargepoint.sendStatusRequest(req.user.get('chargepoint'), session.get('session_id')).then((chargingStatus) => {
          return session.saveFromChargepoint(chargingStatus);
        }));
      });

      return Muni.Promise.all(promises).then(() => {
        const sessionIds = sessions.pluck('session_id');
        res.data = sessionIds;
        return next();
      });
    }).catch(next);
  },

  stop(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');

    return session.fetch({
      query: {
        session_id: _.parseInt(req.params.session_id),
      },
    }).then(() => {
      return session.stopSession();
    }).then(() => {
      res.data = session.render();
      next();
    }).catch(next);
  },

  stopAck(req, res, next) {
    const session = new SessionModel();
    session.db = this.get('db');

    return session.fetch({
      query: {
        session_id: _.parseInt(req.params.session_id),
      },
    }).then(() => {
      return session.stopSessionAck();
    }).then(() => {
      res.data = session.render();
      next();
    }).catch(next);
  },
});
