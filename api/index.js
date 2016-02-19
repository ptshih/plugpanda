// Dependencies
const _ = require('lodash');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
require('muni'); // TODO: weirdly removing this causes promise warnings

// Middleware
const cors = require('cors');
const morgan = require('morgan');
const compress = require('compression');
const responseTime = require('response-time');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');

// Environment
require('dotenv').config({silent: true});
global.nconf = require('nconf');
nconf.env().defaults({
  VERSION: require('../package.json').version || new Date().getTime(),
  NODE_ENV: 'development',
  HOST: 'http://localhost',
  PORT: 9001,
});

// Debug Logging
global.debug = require('./lib/debug');

// Required Envs
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
const redactedEnvs = ['MONGO_SSL_CA'];

console.log('Creating runtime environment...\n');
_.each(requiredEnvs, (requiredEnv) => {
  let requiredEnvValue = nconf.get(requiredEnv);
  if (!requiredEnvValue) {
    console.error(`Missing ${requiredEnv}`);
    process.exit(1);
  }
  if (_.includes(redactedEnvs, requiredEnv)) {
    requiredEnvValue = '[REDACTED]';
  }

  console.log(`├── ${requiredEnv}=${requiredEnvValue}`);
});

// Time units in ms
const oneDay = 86400000;
const oneYear = 31536000000;

// Start express app
const app = express();
app.enable('trust proxy');
app.set('props', {
  pid: process.pid,
  debug: nconf.get('NODE_ENV') === 'development',
  version: nconf.get('VERSION'),
  env: nconf.get('NODE_ENV'),
  port: _.parseInt(nconf.get('PORT')),
  webpackPort: _.parseInt(nconf.get('PORT')) + 1,
});

// App props
const props = app.get('props');
console.log('\nLaunching...\n');
_.each(props, (val, key) => {
  console.log(`├── ${key}=${val}`);
});

// Configure Environment Locals
app.use((req, res, next) => {
  _.assign(res.locals, props);
  next();
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

// Track response time in the `X-Response-Time` header
app.use(responseTime({
  digits: 3,
}));

// Enable CORS
app.use(cors({
  maxAge: oneDay,
}));

// Gzip compression (needs to be before static to compress assets)
app.use(compress());

// Favicon
app.use(favicon(path.join(__dirname, '../public/favicon.ico')));

// Browser Caching
const maxAge = !props.debug ? oneYear : 0;

// Set `/public` as the static content directory
app.use('/fonts', express.static(path.join(__dirname, '../public/fonts'), {
  maxAge: maxAge,
}));
app.use('/img', express.static(path.join(__dirname, '../public/img'), {
  maxAge: maxAge,
}));
app.use('/', express.static(path.join(__dirname, '../public'), {
  maxAge: 0,
}));

// Connect to the database
const db = require('./config/db');
db.connect().then(() => {
  // Start the HTTP server
  app.listen(props.port, () => {
    console.log(`\n├── Express [PORT: ${props.port}] [PID: ${props.pid}] [ENV: ${props.env}]`);
  });
}).then(() => {
  // Routes
  if (props.debug) {
    // Serve from webpack-dev-server
    require('./webpack')(app);
  } else {
    // Serve from compiled assets
    app.use('/assets', express.static(path.join(__dirname, '../assets'), {
      maxAge: maxAge,
    }));
    app.use('/cache.manifest', express.static(path.join(__dirname, '../assets/cache.manifest'), {
      maxAge: 0,
    }));

    // Enable Logging
    // Don't log anything above this line
    app.use(morgan('dev'));

    // API Routes
    app.use('/api', require('./routes'));

    // Serve `index.html` for all other routes
    app.all('*', (req, res) => {
      res.set('Content-Type', 'text/html');
      res.sendFile(path.join(__dirname, '../assets/index.html'));
    });
  }
}).catch((err) => {
  console.error('Express failed to start with error: %s', err.message);
  process.exit(1);
});
