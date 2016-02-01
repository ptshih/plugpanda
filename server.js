// Dependencies
import _ from 'lodash';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import Muni from 'muni';

// Errors
global.APIError = Muni.Error;

// Configuration
global.nconf = require('nconf');
nconf.env().defaults({
  NODE_ENV: 'development',
  VERSION: require('./package.json').version || new Date().getTime(),
  PORT: 9001,
  HOST: 'http://ngrok.petershih.com',
  PANDA_IRON_PROJECT_ID: '55d66dbac7cf220008000062',
  PANDA_MONGODB_USER: 'panda',
  PANDA_MONGODB_PASSWORD: 'sadpanda',
});
global.db = require('./api/config/db');

// Required ENV
if (!nconf.get('TWILIO_ACCOUNT_SID') || !nconf.get('TWILIO_AUTH_TOKEN')) {
  console.error('Missing ENV for TWILIO.');
  process.exit(1);
}

if (!nconf.get('BMW_BASIC_AUTH')) {
  console.error('Missing ENV for BMW_BASIC_AUTH.');
  process.exit(1);
}

if (!nconf.get('PANDA_MONGODB_USER')) {
  console.error('Missing ENV for PANDA_MONGODB_USER.');
  process.exit(1);
}

if (!nconf.get('PANDA_MONGODB_PASSWORD')) {
  console.error('Missing ENV for PANDA_MONGODB_PASSWORD.');
  process.exit(1);
}

if (!nconf.get('PANDA_WORKER_TOKEN')) {
  console.error('Missing ENV for PANDA_WORKER_TOKEN.');
  process.exit(1);
}

if (!nconf.get('PANDA_CLIENT_TOKEN')) {
  console.error('Missing ENV for PANDA_CLIENT_TOKEN.');
  process.exit(1);
}

if (!nconf.get('PANDA_IRON_PROJECT_ID')) {
  console.error('Missing ENV for PANDA_IRON_PROJECT_ID.');
  process.exit(1);
}

if (!nconf.get('PANDA_IRON_TOKEN')) {
  console.error('Missing ENV for PANDA_IRON_TOKEN.');
  process.exit(1);
}

// Middleware
import cors from 'cors';
import morgan from 'morgan';
import compress from 'compression';
import responseTime from 'response-time';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';

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
// app.set('views', path.join(__dirname, '/views'));
// app.set('view engine', 'hbs');
// app.set('view options', {
//   layout: false,
// });

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

// Favicon
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));

// Assets
const maxAge = !app.get('props').debug ? oneYear : 0;

app.use('/', express.static(path.join(__dirname, '/assets'), {
  maxAge: maxAge,
}));

// Set /public as our static content dir
app.use('/fonts', express.static(path.join(__dirname, '/public/fonts'), {
  maxAge: maxAge,
}));
app.use('/img', express.static(path.join(__dirname, '/public/img'), {
  maxAge: maxAge,
}));
app.use('/', express.static(path.join(__dirname, '/public'), {
  maxAge: 0,
}));

// Enable Logging
// Don't log anything above this line
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

// Configure Environment Locals
app.use((req, res, next) => {
  _.assign(res.locals, app.get('props'));
  next();
});

// API database
db.connect().then(() => {
  // API Routes
  app.use('/api', require('./api/routes'));

  // Load Webpack Middleware
  if (app.get('props').debug) {
    const webpackMiddleware = require('./webpack-middleware');
    app.use(webpackMiddleware.devMiddleware);
    app.use(webpackMiddleware.hotMiddleware);

    // Default Server Route
    app.get('*', (req, res) => {
      res.set('Content-Type', 'text/html');
      res.write(webpackMiddleware.devMiddleware.fileSystem.readFileSync(path.join(__dirname, 'assets/index.html')));
      res.end();
    });
  } else {
    // Default Server Route
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'assets/index.html'));
    });
  }

  // Start the HTTP server
  app.listen(app.get('props').port, () => {
    console.log('App with pid: %d listening on port: %d with env: %s', app.get('props').pid, app.get('props').port, app.get('props').env);
  });
}).catch((err) => {
  console.error('App failed to start with error: %s', err.message);
  process.exit(1);
});
