/**
 * Local Storage wrapper
 *
 * https://github.com/marcuswestin/store.js
 */

import store from 'store';

export default {
  set: function(key, val, exp) {
    store.set(key, {
      val: val,
      exp: exp,
      time: new Date().getTime(),
    });
  },

  get: function(key) {
    const info = store.get(key);
    if (!info) {
      return null;
    }
    if (info.exp && new Date().getTime() - info.time > info.exp) {
      return null;
    }
    return info.val;
  },

  remove: function(key) {
    return store.remove(key);
  },
};
