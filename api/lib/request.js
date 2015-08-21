const _ = require('lodash');
const Muni = require('muni');
const request = Muni.Promise.promisify(require('request'));
Muni.Promise.promisifyAll(request);

module.exports = {
  send: Muni.Promise.method((options = {}) => {
    _.defaults(options, {
      withCredentials: false,
      json: true,
    });

    return request(options).then((contents) => {
      const response = contents[0];
      const statusMessage = response.statusMessage || 'Client Error';
      const statusCode = response.statusCode || 500;
      if (statusCode >= 400 && statusCode < 500) {
        const clientErr = new Error(statusMessage);
        clientErr.code = statusCode;
        throw clientErr;
      }

      const body = contents[1];
      return body;
    });
  }),
};
