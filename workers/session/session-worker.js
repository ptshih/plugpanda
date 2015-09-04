// to deploy from cli
// iron_worker upload chargepoint

var worker = require('node_helper');
var _ = require('lodash');
var request = require('request');

var method = _.isString(worker.params.method) ? worker.params.method.toUpperCase() : 'GET';
var url = _.isString(worker.params.url) ? worker.params.url : null;
var accessToken = _.isString(worker.params.access_token) ? worker.params.access_token : null;

if (!url) {
  process.exit(1);
}

// Configure the HTTP request options
var requestOptions = {
  method: method,
  url: url,
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
};

// Send the HTTP request
request(requestOptions, function(error, response, body) {
  if (error) {
    // This means the server is not responsive
    console.log('Failed -> %s', url);
    process.exit(1);
  }

  if (response.statusCode >= 400) {
    // This means the server responded with an error code
    // We are going to treat this as a successful exit
    console.log('Error with Code: %d -> %s', response.statusCode, url);
    process.exit(0);
  }

  console.log('Success -> %s', url);
  process.exit(0);
});
