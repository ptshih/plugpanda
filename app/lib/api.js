/**
 * Placeholder wrapper for XHR to the API
 * For now this is a simple pass-thru
 *
 * Future features:
 * - Set Authentication headers
 * - Parse response envelope
 */

import _ from 'lodash';
import Promise from 'bluebird';
import requestOrig from 'request';
const request = Promise.promisify(requestOrig);
Promise.promisifyAll(request);

import auth from './auth';

const api = {
  _request: Promise.method((options = {}) => {
    _.defaults(options, {
      withCredentials: false,
      json: true,
    });

    return request(options).then((contents) => {
      const response = contents[0];
      const body = contents[1];

      const statusMessage = response.statusMessage || 'Client Error';
      const statusCode = response.statusCode || 500;
      if (statusCode >= 400 && statusCode < 500) {
        const clientErr = new Error(body.data || statusMessage);
        clientErr.code = statusCode;
        throw clientErr;
      }

      return body;
    });
  }),

  fetchCar: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/car/status',
      headers: auth.getHeaders(),
    }).then((body) => {
      return body.data;
    });
  }),

  fetchSession: Promise.method(function(sessionId) {
    return this._request({
      url: window.location.origin + '/api/sessions/' + sessionId,
      headers: auth.getHeaders(),
    }).then((body) => {
      return body.data;
    });
  }),

  fetchHistory: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/sessions',
      headers: auth.getHeaders(),
    }).then((body) => {
      return body.data;
    });
  }),

  fetchAccount: Promise.method(function() {
    return this._request({
      url: window.location.origin + '/api/account',
      headers: auth.getHeaders(),
    }).then((body) => {
      return body.data;
    });
  }),

  login: Promise.method(function(email, password) {
    return this._request({
      method: 'POST',
      url: window.location.origin + '/api/login',
      json: {
        email: email,
        password: password,
      }
    }).then((body) => {
      const user = body.data;
      auth.setAccessToken(user.access_token);
      return user;
    });
  }),
};

export default api;
