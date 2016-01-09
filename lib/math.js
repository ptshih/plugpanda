/**
 * Anything related to math and calculations should go here!
 */

const _ = require('lodash');

module.exports = {
  round(number, digits) {
    digits = _.isNumber(digits) ? digits : 2;
    const scale = Math.pow(10, digits);
    return Math.round(number * scale) / scale;
  },
};
