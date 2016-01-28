const _ = require('lodash');
const Muni = require('muni');
const UserModel = require('./user');
const BaseModel = require('./base');

module.exports = BaseModel.extend({
  definition: function() {
    return _.defaults({},
      _.result(BaseModel.prototype, 'definition'), {
        user_id: {
          type: 'id',
        },
      }
    );
  },

  _expandSeller: function() {
    if (this.expand === 'user') {
      this.set('user', this.user.limitedUser());
    }
  },

  _fetchUser: Muni.Promise.method(function() {
    // User already fetched
    if (this.user instanceof UserModel || !this.get(this.userIdAttribute)) {
      this._expandSeller();
      return this.user;
    }

    // User not fetched
    const user = new UserModel();
    user.db = this.db;
    user.set(user.idAttribute, this.get(this.userIdAttribute));
    return user.fetch().bind(this).tap(function() {
      this.user = user;
      this._expandSeller();
    });
  }),

  // Fetch the user if it does not already exist
  afterFetch: Muni.Promise.method(function() {
    const originalArguments = arguments;
    return this._fetchUser().bind(this).then(function() {
      return BaseModel.prototype.afterFetch.apply(this, originalArguments);
    });
  }),

  // Fetch the user if it does not already exist
  afterSave: Muni.Promise.method(function() {
    const originalArguments = arguments;
    return this._fetchUser().bind(this).then(function() {
      return BaseModel.prototype.afterSave.apply(this, originalArguments);
    });
  }),
});
