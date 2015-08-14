/**
 * Placeholder wrapper for XHR to the API
 * For now this is a simple pass-thru
 *
 * Future features:
 * - Set Authentication headers
 * - Parse response envelope
 */

// import _ from 'lodash';
import Promise from 'bluebird';
import requestOrig from 'request';
const request = Promise.promisify(requestOrig);
Promise.promisifyAll(request);


const api = {
  _baseUrl: 'http://dev.trycelery.com:3000/v2',

  _request: Promise.method((url) => {
    return request({
      url: url,
      withCredentials: false,
      json: true,
    }).then((contents) => {
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

  _fetch: Promise.method((url) => {
    return this._request(url).then((body) => {
      return body.data;
    });
  }),

  // BMW

  // POST
  sendPOI: Promise.method(() => {

  }),

  // POST
  executeService: Promise.method(() => {

  }),

  // Chargepoint

  // GET
  fetchChargingStatus: Promise.method(() => {

  }),

  // GET
  fetchChargingActivity: Promise.method(() => {

  }),

  // POST
  stopChargingSession: Promise.method(() => {

  }),

};

export default api;
