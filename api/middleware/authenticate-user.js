const UserModel = require('../models/user');

// Get `access_token` from `req`
// Attempts to get an `access_token` from the `Authorization` header
// Uses several fallbacks to read the token
// Also falls back to reading `access_token` from the query string
function accessTokenFromRequest(req) {
  let accessToken;

  if (req.headers.authorization) {
    // Use HTTP Auth header
    const parts = req.headers.authorization.split(' ');
    const scheme = parts[0];
    const credentials = parts[1];

    if (scheme === 'Basic') {
      // HTTP Basic
      const userPass = new Buffer(credentials, 'base64').toString().split(':');
      if (userPass.length > 1) {
        // Base64
        accessToken = userPass[0];
      } else {
        // Not Base64
        accessToken = credentials;
      }
    } else if (scheme === 'Bearer') {
      // HTTP Bearer
      accessToken = credentials;
    } else {
      // Fallback if access_token is passed directly without scheme
      accessToken = scheme;
    }
  } else if (req.query.access_token) {
    // Use query string
    accessToken = req.query.access_token;
  }

  return accessToken;
}

module.exports = function(req, res, next) {
  const accessToken = accessTokenFromRequest(req);

  if (!accessToken) {
    return next(new Error(`Invalid Access Token.`));
  }

  const user = new UserModel();
  user.db = db; // global
  return user.fetch({
    query: {
      access_token: accessToken,
    },
    require: true,
  }).then(function() {
    // Authenticated
    req.user = user;

    return next();
  }).catch((err) => {
    return next(new Error(`Error authenticating User: ${err.message}`));
  });
};
