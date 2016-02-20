// Force NODE_ENV to be `test`
process.env.NODE_ENV = 'test';

const fs = require('fs');
const path = require('path');

// Chai
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-datetime'));
global.assert = chai.assert;

// Sinon
global.sinon = require('sinon');
require('sinon-as-promised')(require('bluebird'));

// Console
console.json = function(object, pretty) {
  pretty = pretty || false;

  let json;
  if (pretty) {
    json = JSON.stringify(object, null, 2);
  } else {
    json = JSON.stringify(object);
  }

  console.log.call(console, json);
};

const inspect = require('eyes').inspector({
  maxLength: 32768,
  sortObjectKeys: true,
  hideFunctions: true,
});
console.inspect = inspect;

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
global.debug = require('../api/lib/debug');

// Test object
global.test = {
  getFixture: function(filename) {
    return fs.readFileSync(path.join(__dirname, './fixtures/', filename), 'utf8').trim();
  },

  getFixtureJSON(filename) {
    let json = {};
    try {
      json = JSON.parse(this.getFixture(filename + '.json'));
    } catch (err) {
      console.error(err);
    }
    return json;
  },
};
