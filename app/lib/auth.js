import _ from 'lodash';
import localStorage from './local-storage';

const auth = {
  isLoggedIn() {
    return _.isString(localStorage.get('access_token'));
  },

  getHeaders() {
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

export default auth;
