/**
 * Authentication using local storage
 */

import _ from 'lodash';
import localStorage from './local-storage';

export default {
  /**
   * Check to see if there is an access token in local storage
   * @return {Boolean} Whether or not there is a stored access token from a previous session
   */
  isLoggedIn() {
    return _.isString(localStorage.get('access_token'));
  },

  isAdmin() {
    return this.getFeatures('admin');
  },

  isWaitlisted() {
    return this.getFeatures('waitlisted');
  },

  /**
   * Used by the API library to build request headers including the access token
   * @return {Object} Request headers with Authorization defined
   */
  buildAuthHeaders() {
    return {
      Authorization: `Bearer ${this.getAccessToken()}`,
    };
  },

  setAccessToken(accessToken) {
    localStorage.set('access_token', accessToken);
  },

  getAccessToken() {
    return localStorage.get('access_token');
  },

  removeAccessToken() {
    localStorage.remove('access_token');
  },

  setFeatures(features) {
    localStorage.set('features', features);
  },

  getFeatures(key) {
    if (key) {
      return _.get(localStorage.get('features'), key);
    }

    return localStorage.get('features');
  },

  removeFeatures() {
    localStorage.remove('features');
  },
};
