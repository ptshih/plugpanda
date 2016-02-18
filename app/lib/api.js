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
      auth.setFeatures(user.features);
      return user;
    });
  }),

  register: Promise.method(function(email, password) {
    return this._request({
      method: 'POST',
      url: window.location.origin + '/api/register',
      json: {
        email: email,
        password: password,
      },
    }).then((user) => {
      auth.setAccessToken(user.access_token);
      auth.setFeatures(user.features);
      return user;
    });
  }),

  forgotPassword: Promise.method(function(email) {
    return this._request({
      method: 'POST',
      url: window.location.origin + '/api/forgot_password',
      json: {
        email: email,
      },
    }).then(() => {
      return email;
    });
  }),

  resetPassword: Promise.method(function(token, password) {
    return this._request({
      method: 'POST',
      url: window.location.origin + '/api/reset_password',
      json: {
        token: token,
        password: password,
      },
    }).then((user) => {
      auth.setAccessToken(user.access_token);
      auth.setFeatures(user.features);
      return user;
    });
  }),

  fetchDashboard: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/dashboard',
      headers: auth.buildAuthHeaders(),
    });
  }),

  fetchBmw: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/bmw/status',
      headers: auth.buildAuthHeaders(),
    });
  }),

  fetchSession: Promise.method(function(opts, sessionId) {
    opts = _.isPlainObject(opts) ? opts : {};
    return this._request({
      url: `${window.location.origin}/api/sessions/${sessionId}`,
      headers: auth.buildAuthHeaders(),
    });
  }),

  stopSession: Promise.method(function(sessionId) {
    return this._request({
      method: 'POST',
      url: `${window.location.origin}/api/sessions/${sessionId}/stop`,
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

  saveAccount: Promise.method(function(json) {
    return this._request({
      method: 'PUT',
      url: window.location.origin + '/api/account',
      headers: auth.buildAuthHeaders(),
      json: json,
    }).then((user) => {
      auth.setFeatures(user.features);
      return user;
    });
  }),

  fetchWaitlist: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/waitlist',
      headers: auth.buildAuthHeaders(),
    });
  }),

  fetchWaitlistPosition: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/waitlist_position',
      headers: auth.buildAuthHeaders(),
    });
  }),

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
