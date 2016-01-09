/**
 * Wrapper around PlugPanda API responses and errors
 */

import _ from 'lodash';
import querystring from 'querystring';
import Promise from 'bluebird';
import request from '../../lib/request';
import auth from './auth';

export default {
  login: Promise.method(function(email, password) {
    return this._request({
      method: 'POST',
      url: window.location.origin + '/api/login',
      json: {
        email: email,
        password: password,
      },
    }).then((user) => {
      auth.setAccessToken(user.access_token);
      auth.setFeatures({
        car: true,
        chargepoint: true,
        getaround: true,
      });
      return user;
    });
  }),

  register: Promise.method(function(email) {
    return this._request({
      method: 'POST',
      url: window.location.origin + '/api/register',
      json: {
        email: email,
      },
    }).then((user) => {
      auth.setAccessToken(user.access_token);
      return user;
    });
  }),

  fetchCar: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/car/status',
      headers: auth.buildAuthHeaders(),
    });
  }),

  fetchSession: Promise.method(function(opts, sessionId) {
    opts = _.isPlainObject(opts) ? opts : {};
    return this._request({
      url: window.location.origin + '/api/sessions/' + sessionId,
      headers: auth.buildAuthHeaders(),
    });
  }),

  fetchSessions: Promise.method(function(opts) {
    opts = _.isPlainObject(opts) ? opts : {};
    return this._request({
      url: window.location.origin + '/api/sessions?' + querystring.stringify(opts),
      headers: auth.buildAuthHeaders(),
    });
  }),

  fetchAccount: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/account',
      headers: auth.buildAuthHeaders(),
    });
  }),

  // TODO: after `saveAccount`, remember to call `auth.setFeatures()`

  _request: Promise.method(function(opts) {
    return request(opts).then((body) => {
      return body.data;
    }).catch((err) => {
      const apiErr = new Error();
      if (err.timeout) {
        apiErr.code = 408;
        apiErr.message = 'Request Timeout';
      } else if (err.status && err.response) {
        apiErr.code = err.status;
        if (_.isObject(err.response.body)) {
          apiErr.message = err.response.body.data;
        } else if (_.isString(err.response.text)) {
          apiErr.message = err.response.text;
        } else {
          apiErr.message = 'Unknown Client Error';
        }
      } else {
        apiErr.code = 500;
        apiErr.message = 'Internal Server Error';
      }
      throw apiErr;
    });
  }),
};
