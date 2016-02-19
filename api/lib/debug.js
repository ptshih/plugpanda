const debug = require('debug');

module.exports = {
  log: debug('log'),
  info: debug('info'),
  warn: debug('warn'),
  error: debug('error'),
};
