const _ = require('lodash');
const bcrypt = require('bcrypt');
const Muni = require('muni');
const Chance = require('chance');
const chance = new Chance();
const chargepoint = require('../lib/chargepoint');

const BaseModel = require('./base');

module.exports = BaseModel.extend({
  urlRoot: 'users',

  readOnlyAttributes() {
    return {
      salt: true,
      secret: true,
      hash: true,

      access_token: true,
      admin: true,
      beta: true,
    };
  },

  hiddenAttributes() {
    return {
      salt: true,
      secret: true,
      hash: true,
      admin: true,
      beta: true,
    };
  },

  defaults() {
    return _.extend({},
      _.result(BaseModel.prototype, 'defaults'), {
        secret: Muni.randomHash(),
        salt: bcrypt.genSaltSync(10),
        hash: null,

        access_token: null,
        admin: false,
        beta: false,

        email: null,
        name: null,
        currency: 'usd',
        timezone: 'utc',

        stripe: {
          customer: null,
          subscription: null,
        },

        bmw: {
          access_token: null,
          token_type: 'Bearer',
          expires_in: 28800,
          refresh_token: null,
          scope: null,
          expires_at: 0,
          vin: null,
        },

        chargepoint: {
          user_id: 0,
          auth_token: null,
        },
      }
    );
  },

  schema() {
    return _.extend({},
      _.result(BaseModel.prototype, 'schema'), {
        secret: 'string',
        salt: 'string',
        hash: 'string',

        access_token: 'string',
        admin: 'boolean',
        beta: 'boolean',

        email: 'string',
        name: 'string',
        currency: 'string',
        timezone: 'string',

        stripe: {
          customer: 'string',
          subscription: 'string',
        },

        bmw: {
          access_token: 'string',
          token_type: 'Bearer',
          expires_in: 'uinteger',
          refresh_token: 'string',
          scope: 'string',
          expires_at: 'timestamp',
          vin: 'string',
        },

        chargepoint: {
          user_id: 'uinteger',
          auth_token: 'string',
        },
      }
    );
  },

  validate() {
    if (!this.get('email')) {
      return new Muni.Error('User requires an email.', 400);
    }
  },

  decryptAccessToken(accessToken) {
    return JSON.parse(Muni.decryptString(accessToken, 'aes256', config.client_id));
  },

  setFromRequest: Muni.Promise.method(function(body) {
    return Muni.Promise.bind(this).then(function() {
      return this._validateEmail(body);
    }).then(function() {
      return this._validatePassword(body);
    }).then(function() {
      return BaseModel.prototype.setFromRequest.call(this, body);
    });
  }),

  _validateEmail: Muni.Promise.method(function(body) {
    const email = Muni.sanitizeEmail(body.email);
    if (!email) {
      return body;
    }

    // Sanitize and Validate
    if (!Muni.isValidEmail(email)) {
      throw new Muni.Error('Invalid `email` provided.', 400);
    }

    body.email = email;
    return body;
  }),

  // Validate and sanitize passwords
  _validatePassword: Muni.Promise.method(function(body) {
    const password = _.trim(body.password);

    if (!password) {
      return body;
    }

    if (password.length < 8) {
      throw new Muni.Error('Password must be at least 8 characters long.', 400);
    }

    body.password = password;
    return body;
  }),

  setPassword(password) {
    if (!password) {
      return this;
    }

    const hash = this.hashPassword(password, this.get('salt'));
    this.set('hash', hash);

    return this;
  },

  // Convert plain text password into a hash
  hashPassword(password, salt) {
    return bcrypt.hashSync(password, salt);
  },

  // Generate a random password
  generateRandomPassword() {
    return chance.string({
      length: 8,
      pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
    });
  },

  // Generates an access token using `_id` and a timestamp
  generateAccessToken() {
    return Muni.encryptString(JSON.stringify({
      _id: this.id,
      created: (new Date()).getTime(),
    }), 'aes256', nconf.get('PANDA_CLIENT_TOKEN'));
  },

  // Login to Chargepoint and get `user_id` and `auth_token`
  authenticateChargepoint(email, password) {
    return chargepoint.sendLoginRequest(email, password).tap((login) => {
      this.set('chargepoint', {
        user_id: _.parseInt(login.user_id),
        auth_token: login.auth_token,
      });
    }).return(this);
  },

  // Return name parsed from email
  _usernameFromEmail(email) {
    const matches = /[(\W|^)[\w.+\-]{0,25}(?=@)/.exec(email);
    return _.first(matches);
  },

  beforeSave: Muni.Promise.method(function() {
    // If name is not provided, extract it from email
    if (!this.get('name')) {
      this.set('name', this._usernameFromEmail(this.get('email')));
    }

    return BaseModel.prototype.beforeSave.apply(this, arguments);
  }),

  save: Muni.Promise.method(function() {
    return BaseModel.prototype.save.apply(
      this,
      arguments
    ).bind(this).catch(function(err) {
      // Catch the mongodb `11000` error code, which is a duplicate index error
      if (err && err.message && /E11000/.test(err.message)) {
        // Duplicate key error
        throw new Muni.Error('User with email already exists.', 409);
      } else {
        // Some other error, just bubble it up
        throw new Muni.Error(err.message, 500);
      }
    });
  }),
});
