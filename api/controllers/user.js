// const _ = require('lodash');
const Muni = require('muni');
const UserModel = require('../models/user');
const BaseController = require('./base');

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
  },


  // POST
  // Updated this method to NOT user a UserModel
  // Because it needs to support BOTH V1 and V2 users
  login: function(req, res, next) {
    const email = Muni.sanitizeEmail(req.body.email || req.query.email);
    const password = req.body.password || req.query.password;

    return Muni.Promise.bind(this).then(function() {
      const user = new UserModel();
      user.db = this.get('db');
      return user.fetch({
        query: {
          email: email,
        },
      });
    }).tap(function(user) {
      if (user.isNew()) {
        throw new Muni.Error('User with email `' + email + '` not found.', 404);
      }

      if (user.get('hash') !== user.hashPassword(password, user.get('salt'))) {
        throw new Muni.Error(`Invalid password for email: ${user.get('email')}.`, 401);
      }
    }).then(this.render(req, res, next)).catch(next);
  },

  // POST
  register: function(req, res, next) {
    const email = Muni.sanitizeEmail(req.body.email || req.query.email);
    let password = req.body.password || req.query.password;
    const name = req.body.name || null;

    return Muni.Promise.bind(this).then(function() {
      const user = new UserModel();
      user.db = this.get('db');
      return user;
    }).tap(function(user) {
      if (!password) {
        password = user.generateRandomPassword();
      }
      return user.setPassword(password);
    }).tap(function(user) {
      return user.setFromRequest({
        email: email,
        name: name,
      });
    }).tap(function(user) {
      user.set('access_token', user.generateAccessToken());
      return user.save();
    }).then(this.render(req, res, next)).catch(next);
  },
});
