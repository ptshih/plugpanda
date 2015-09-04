/**
 * Placeholder wrapper for XHR to the API
 * For now this is a simple pass-thru
 *
 * Future features:
 * - Set Authentication headers
 * - Parse response envelope
 */

// import _ from 'lodash';
import Promise from 'bluebird';
import request from '../../lib/request';
import auth from './auth';

const api = {
  fetchCar: Promise.method(function() {
    return request({
      url: window.location.origin + '/api/car/status',
      headers: auth.getHeaders(),
    }).then((body) => {
      return body.data;
    });
  }),

  fetchSession: Promise.method(function(sessionId) {
    return request({
      url: window.location.origin + '/api/sessions/' + sessionId,
      headers: auth.getHeaders(),
    }).then((body) => {
      return body.data;
    });
  }),

  fetchHistory: Promise.method(function() {
    return request({
      url: window.location.origin + '/api/sessions',
      headers: auth.getHeaders(),
    }).then((body) => {
      return body.data;
    });
  }),

  fetchAccount: Promise.method(function() {
    return request({
      url: window.location.origin + '/api/account',
      headers: auth.getHeaders(),
    }).then((body) => {
      return body.data;
    });
  }),

  login: Promise.method(function(email, password) {
    return request({
      method: 'POST',
      url: window.location.origin + '/api/login',
      json: {
        email: email,
        password: password,
      },
    }).then((body) => {
      const user = body.data;
      auth.setAccessToken(user.access_token);
      return user;
    });
  }),
};

export default api;
