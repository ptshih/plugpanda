/**
 * Anything related to math and calculations should go here!
 */

export default {
  round(number, digits = 2) {
    const scale = Math.pow(10, digits);
    return Math.round(number * scale) / scale;
  },
};
