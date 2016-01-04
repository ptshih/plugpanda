/**
 * Anything related to money and currency should go here!
 */

const _ = require('lodash');
const accounting = require('accounting');

module.exports = {
  symbolForCurrency(currency) {
    let symbol = '';

    if (currency) {
      switch (currency.toLowerCase()) {
        case 'gbp':
          symbol = '£';
          break;
        case 'usd':
          symbol = '$';
          break;
        case 'cad':
          symbol = 'C$';
          break;
        case 'eur':
          symbol = '€';
          break;
        case 'aud':
          symbol = 'A$';
          break;
        default:
          break;
      }
    }

    return symbol;
  },

  centsToDollars(value) {
    return accounting.formatNumber(accounting.toFixed(value / 100, 2), 2);
  },

  dollarsToCents(value) {
    return _.parseInt(accounting.toFixed(accounting.unformat(value) * 100, 0));
  },
};
