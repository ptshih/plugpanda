// Force NODE_ENV to be `test`
process.env.NODE_ENV = 'test';

// Chai
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-datetime'));
global.assert = chai.assert;

// Sinon
global.sinon = require('sinon');
require('sinon-as-promised')(require('bluebird'));


const inspect = require('eyes').inspector({
  maxLength: 32768,
  sortObjectKeys: true,
  hideFunctions: true,
});
console.inspect = inspect;
