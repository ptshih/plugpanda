/**
 * Anything related to math and calculations should go here!
 */

module.exports = {
  round(number, digits = 2) {
    const scale = Math.pow(10, digits);
    return Math.round(number * scale) / scale;
  },
};
