const _ = require('lodash');
const Muni = require('muni');
const chargepoint = require('../lib/chargepoint');

const authenticateUserMiddleware = require('../middleware/authenticate_user');

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
      sort: [['created', 'desc']],
    }).tap(() => {
      if (query.session_id) {
        return chargepoint.sendStatusRequest(req.user.get('chargepoint'), query.session_id).then((chargingStatus) => {
          // Update from Chargepoint
          return session.saveFromChargepoint(chargingStatus);
        });
      }
    }).then(() => {
      res.data = session.render();
      next();
    }).catch(next);
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

  history(req, res, next) {
    const qo = this.parseQueryString(req, {
      queryParams: {
        status: 'string',
        current_charging: 'string',
        payment_type: 'string',
        device_id: 'integer',
      },
      sortParam: 'created',
      sortOrder: 'desc',
    });

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
        updated: {
          $lt: new Date().getTime() - 900000, // 15 minutes
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
    }).then((stopSession) => {
      res.data = stopSession;
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
    }).then((body) => {
      res.data = body;
      next();
    }).catch(next);
  },
});
