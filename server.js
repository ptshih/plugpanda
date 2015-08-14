// Dependencies
const _ = require('lodash');
const express = require('express');
const path = require('path');

// Configuration
const nconf = require('nconf');
nconf.env().defaults({
  NODE_ENV: 'development',
  VERSION: require('./package.json').version,
  PORT: 9001,
});

// Transparently support JSX
require('babel/register');

// Middleware
const cors = require('cors');
const morgan = require('morgan');
const compress = require('compression');
const responseTime = require('response-time');
const favicon = require('serve-favicon');

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
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'hbs');
app.set('view options', {
  layout: false,
});

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

// Enable Logging
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

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

// Configure Environment Locals
app.use((req, res, next) => {
  _.extend(res.locals, app.get('props'));
  next();
});

// API Routes
app.use('/api', require('./routes'));

// Default Server Route
app.get('*', (req, res) => {
  res.render('index');
});

// Start the HTTP server
app.listen(app.get('props').port, () => {
  console.log('App with pid: %d listening on port: %d with env: %s', app.get('props').pid, app.get('props').port, app.get('props').env);
});
