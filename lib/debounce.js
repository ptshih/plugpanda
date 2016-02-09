/**
 * Lodash _.debounce
 * https://github.com/lodash/lodash/blob/4.3.0/lodash.js#L8577
 */

const Promise = require('bluebird');

module.exports = function(thenable, wait) {
  if (typeof thenable !== 'function') {
    throw new Error('Parameter `thenable` must be a function.');
  }
  wait = parseInt(wait, 10) || 0;
  let timer;

  const debounced = function() {
    const args = arguments;

    return new Promise((resolve) => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(function() {
        timer = null;
        return resolve();
      }, wait);
    }).then(() => {
      return thenable.apply(thenable, args);
    });
  };

  debounced.cancel = function() {
    if (timer) {
      clearTimeout(timer);
    }
  };

  return debounced;
};
