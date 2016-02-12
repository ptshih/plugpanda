// Dependencies
const _ = require('lodash');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const Muni = require('muni');

// Errors
global.APIError = Muni.Error;

// Environment
require('dotenv').config({silent: true});
global.nconf = require('nconf');
nconf.env().defaults({
  VERSION: require('../package.json').version || new Date().getTime(),
  NODE_ENV: 'development',
  HOST: 'http://localhost',
  PORT: 9001,
});

const requiredEnvs = [
  'NODE_ENV',
  'VERSION',
  'HOST',
  'PORT',
  'MONGODB_USER',
  'MONGODB_PASSWORD',
  'MONGODB_URL',
  'MONGO_SSL_CA',
  'CLIENT_TOKEN',
  'WORKER_TOKEN',
  'COULOMB_SESS',
  'BMW_BASIC_AUTH',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_NUMBER',
  'IRON_PROJECT_ID',
  'IRON_TOKEN',
  'MAILGUN_KEY',
];

_.each(requiredEnvs, (requiredEnv) => {
  if (!nconf.get(requiredEnv)) {
    console.error(`Missing ${requiredEnv}`);
    process.exit(1);
  }
  console.log(`${requiredEnv} -> ${nconf.get(requiredEnv)}`);
});

// Database
global.db = require('./config/db');

// Middleware
const cors = require('cors');
const morgan = require('morgan');
const compress = require('compression');
const responseTime = require('response-time');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');

// Time units in ms
const oneDay = 86400000;
const oneYear = 31536000000;

// Start express app
const app = express();
app.enable('trust proxy');
app.set('props', {
  debug: nconf.get('NODE_ENV') === 'development',
  version: nconf.get('VERSION'),
  env: nconf.get('NODE_ENV'),
  port: nconf.get('PORT'),
  pid: process.pid,
});

// Helmet HTTP headers
app.use(helmet());

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Parse application/json
// Set entity limit to 10mb
app.use(bodyParser.json({
  limit: '10mb',
}));

// Gzip compression (needs to be before static to compress assets)
app.use(compress());

// Track response time in the `X-Response-Time` header
app.use(responseTime({
  digits: 3,
}));

// Enable CORS
app.use(cors({
  maxAge: oneDay,
}));

// Configure Environment Locals
app.use((req, res, next) => {
  _.assign(res.locals, app.get('props'));
  next();
});

// Favicon
app.use(favicon(path.join(__dirname, '../public/favicon.ico')));

// Assets
const maxAge = !app.get('props').debug ? oneYear : 0;

app.use('/js', express.static(path.join(__dirname, '../assets/js'), {
  maxAge: maxAge,
}));
app.use('/css', express.static(path.join(__dirname, '../assets/css'), {
  maxAge: maxAge,
}));
app.use('/cache.manifest', express.static(path.join(__dirname, '../assets/cache.manifest'), {
  maxAge: 0,
}));

// Set /public as our static content dir
app.use('/fonts', express.static(path.join(__dirname, '../public/fonts'), {
  maxAge: maxAge,
}));
app.use('/img', express.static(path.join(__dirname, '../public/img'), {
  maxAge: maxAge,
}));
app.use('/', express.static(path.join(__dirname, '../public'), {
  maxAge: 0,
}));

// Enable Logging
// Don't log anything above this line
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

// API database
db.connect().then(() => {
  // API Routes
  app.use('/api', require('./routes'));

  // Load Webpack Middleware
  if (app.get('props').debug) {
    const webpackMiddleware = require('../webpack-middleware');
    app.use(webpackMiddleware.devMiddleware);

    // Default Server Route
    app.get('*', (req, res) => {
      res.set('Content-Type', 'text/html');
      res.write(webpackMiddleware.devMiddleware.fileSystem.readFileSync(path.join(__dirname, '../assets/index.html')));
      res.end();
    });
  } else {
    // Default Server Route
    app.get('*', (req, res) => {
      res.set('Content-Type', 'text/html');
      res.sendFile(path.join(__dirname, '../assets/index.html'));
    });
  }

  // Start the HTTP server
  app.listen(app.get('props').port, () => {
    console.log(
      'App with pid: %d listening on port: %d with env: %s',
      app.get('props').pid,
      app.get('props').port,
      app.get('props').env)
    ;
  });
}).catch((err) => {
  console.error('App failed to start with error: %s', err.message);
  process.exit(1);
});
