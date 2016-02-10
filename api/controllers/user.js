const _ = require('lodash');
const Muni = require('muni');
const UserModel = require('../models/user');
const BaseController = require('./base');

const authenticateUserMiddleware = require('../middleware/authenticate-user');
const authenticateAdminMiddleware = require('../middleware/authenticate-admin');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    // Login
    // Public
    // Requires `email` AND `password` params
    this.routes.post['/login'] = {
      action: this.login,
      requiredParams: ['email', 'password'],
    };

    // Register
    // Public
    // Requires `email` AND `password` params
    this.routes.post['/register'] = {
      action: this.register,
      requiredParams: ['email'],
    };

    // Private

    this.routes.get['/waitlist'] = {
      action: this.waitlist,
      middleware: [authenticateUserMiddleware, authenticateAdminMiddleware],
    };

    this.routes.get['/waitlist_position'] = {
      action: this.waitlistPosition,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.get['/account'] = {
      action: this.account,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.put['/account'] = {
      action: this.updateAccount,
      middleware: [authenticateUserMiddleware],
    };

    this.routes.post['/account/chargepoint'] = {
      action: this.chargepoint,
      middleware: [authenticateUserMiddleware],
      requiredParams: ['email', 'password'],
    };
  },

  waitlist(req, res, next) {
    this.get('db').find('users', {
      waitlisted_date: {
        $ne: null,
      },
      'features.waitlisted': true,
    }, {
      fields: {
        email: 1,
        name: 1,
        waitlisted_date: 1,
      },
      sort: [['waitlisted_date', 'asc']],
    }).then((result) => {
      res.data = {
        users: _.head(result),
        count: _.last(result),
      };
      return next();
    }).catch(next);
  },

  waitlistPosition(req, res, next) {
    // TODO: move to model
    this.get('db').count('users', {
      waitlisted_date: {
        $lt: req.user.get('waitlisted_date'),
      },
    }).then((count) => {
      res.data = {
        position: count + 1,
      };
      return next();
    }).catch(next);
  },

  account(req, res, next) {
    res.data = req.user.render();
    return next();
  },

  updateAccount(req, res, next) {
    return req.user.setFromRequest(req.body).then(() => {
      return req.user.save();
    }).then(() => {
      res.data = req.user.render();
      return next();
    }).catch(next);
  },

  chargepoint(req, res, next) {
    const email = Muni.sanitizeEmail(req.body.email || req.query.email);
    const password = (req.body.password || req.query.password).trim();
    return req.user.authenticateChargepoint(email, password).then(() => {
      return req.user.save();
    }).then(() => {
      res.data = req.user.render();
      return next();
    }).catch(next);
  },

  // POST
  // Updated this method to NOT user a UserModel
  // Because it needs to support BOTH V1 and V2 users
  login(req, res, next) {
    const email = Muni.sanitizeEmail(req.body.email || req.query.email);
    const password = (req.body.password || req.query.password || '').trim();

    return Muni.Promise.bind(this).then(function() {
      const user = new UserModel();
      user.db = this.get('db');
      return user.fetch({
        query: {
          email: email,
        },
      });
    }).tap((user) => {
      if (user.isNew()) {
        throw new Muni.Error('User with email `' + email + '` not found.', 404);
      }

      if (user.get('hash') !== user.hashPassword(password, user.get('salt'))) {
        throw new Muni.Error(`Invalid password for email: ${user.get('email')}.`, 401);
      }
    }).then(this.render(req, res, next)).catch(next);
  },

  // POST
  register(req, res, next) {
    const email = Muni.sanitizeEmail(req.body.email || req.query.email);
    let password = (req.body.password || req.query.password || '').trim();
    const name = req.body.name || null;

    console.log(password);

    return Muni.Promise.bind(this).then(() => {
      const user = new UserModel();
      user.db = this.get('db');
      return user;
    }).tap((user) => {
      if (!password) {
        password = user.generateRandomPassword();
      }
      return user.setPassword(password);
    }).tap((user) => {
      return user.setFromRequest({
        email: email,
        name: name,
      });
    }).tap((user) => {
      user.set('access_token', user.generateAccessToken());
      return user.save();
    }).then(this.render(req, res, next)).catch(next);
  },
});
