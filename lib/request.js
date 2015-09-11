const _ = require('lodash');
const request = require('superagent');
const Promise = require('bluebird');

module.exports = Promise.method((opts = {}) => {
  const deferred = Promise.defer();

  let options;
  if (_.isString(opts)) {
    options = {
      url: opts,
    };
  } else if (_.isObject(opts)) {
    options = _.clone(opts);
  } else {
    throw new Error('Invalid options.');
  }

  // HTTP method
  let method = (options.method || 'get').toLowerCase();
  method = _.includes(['head', 'get', 'post', 'put', 'del'], method) ? method : 'get';

  // Create the request with url
  const req = request[method](options.url);

  // Timeout (ms)
  req.timeout(_.parseInt(options.timeout) || 15000);

  // Type (MIME)
  if (_.isString(options.type)) {
    req.type(options.type);
  }

  // Accept (MIME)
  if (_.isString(options.accept)) {
    req.accept(options.accept);
  }

  // Headers
  if (_.isObject(options.headers)) {
    req.set(options.headers);
  }

  // Query
  if (_.isObject(options.query)) {
    req.query(options.query);
  } else if (_.isString(options.querystring)) {
    req.query(options.querystring);
  }

  // Body (json or form)
  if (_.isObject(options.json)) {
    req.type('json');
    req.send(options.json);
  } else if (_.isObject(options.form)) {
    req.type('form');
    req.send(options.form);
  }

  // CORS
  // "Access-Control-Allow-Origin" is not a wildcard ("*")
  // "Access-Control-Allow-Credentials" is "true"
  if (options.withCredentials) {
    req.withCredentials();
  }

  req.end((err, res) => {
    if (err) {
      err.code = err.status;
      return deferred.reject(err);
    }

    if (res.type === 'application/json' || res.type === 'application/x-www-form-urlencoded') {
      return deferred.resolve(res.body);
    }

    if (res.type === 'text/html') {
      return deferred.resolve(res.text);
    }

    return deferred.resolve(res.text);
  });

  return deferred.promise;
});
