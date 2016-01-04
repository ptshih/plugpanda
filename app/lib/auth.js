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

  /**
   * Used by the API library to build request headers including the access token
   * @return {Object} Request headers with Authorization defined
   */
  buildAuthHeaders() {
    return {
      Authorization: `Bearer ${localStorage.get('access_token')}`,
    };
  },

  setAccessToken(accessToken) {
    localStorage.set('access_token', accessToken);
  },

  removeAccessToken() {
    localStorage.remove('access_token');
  },
};
