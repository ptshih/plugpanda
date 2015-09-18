import _ from 'lodash';
import Promise from 'bluebird';
import request from '../../lib/request';
import auth from './auth';

const api = {
  // Wrapper around PlugPanda API responses and errors
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

  fetchCar: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/car/status',
      headers: auth.getHeaders(),
    });
  }),

  fetchSession: Promise.method(function(sessionId) {
    return this._request({
      url: window.location.origin + '/api/sessions/' + sessionId,
      headers: auth.getHeaders(),
    });
  }),

  fetchHistory: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/sessions',
      headers: auth.getHeaders(),
    });
  }),

  fetchAccount: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/account',
      headers: auth.getHeaders(),
    });
  }),

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
};

export default api;
