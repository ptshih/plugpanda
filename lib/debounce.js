/**
 * Turns async functions sync
 * http://bl.ocks.org/simenbrekken/16efd96373b207ad7bdc
 */

const Promise = require('bluebird');

module.exports = (callback, wait, leading) => {
  let timer;

  return function() {
    const context = this;
    const args = arguments;
    let resolve;
    let called;

    const promise = new Promise(function(deferred) {
      resolve = deferred;
    }).then(function() {
      return callback.apply(context, args);
    });

    if (leading) {
      if (timer) {
        called = true;
      } else {
        resolve();
      }
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(function() {
      timer = null;

      if (!leading || called) {
        resolve();
      }
    }, wait);

    return promise;
  };
};
