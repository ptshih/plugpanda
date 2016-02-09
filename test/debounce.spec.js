const _ = require('lodash');
const debounce = require('../lib/debounce');
const Promise = require('bluebird');

describe('Debounce', function() {
  // Set max timeout allowed
  this.timeout(10000);

  it('should only call thenable once', function(done) {
    const obj = {
      foo: 'bar',

      // A function that returns a thenable
      thenable: function(text) {
        assert.strictEqual(this.foo, 'bar');
        return new Promise((resolve) => {
          resolve(text);
        });
      },
    };

    // Create debounced function that returns a thenable
    const debounced = debounce(obj.thenable.bind(obj), 1000);

    debounced('hello world').then(() => {
      // Should not be called
      assert.ok(0);
    });
    debounced('hello again').then(() => {
      // Should not be called
      assert.ok(0);
    });
    debounced('hello final').then((text) => {
      assert.strictEqual(text, 'hello final');
      done();
    });
  });

  it('should cancel', function(done) {
    const obj = {
      foo: 'bar',

      // A function that returns a thenable
      thenable: function(text) {
        assert.strictEqual(this.foo, 'bar');
        return new Promise((resolve) => {
          resolve(text);
        });
      },
    };

    // Create debounced function that returns a thenable
    const debounced = debounce(obj.thenable.bind(obj), 1000);

    debounced('hello world').then(() => {
      // Should not be called
      assert.ok(0);
    });
    debounced('hello again').then(() => {
      // Should not be called
      assert.ok(0);
    });
    debounced('hello final').then(() => {
      // Should not be called
      assert.ok(0);
    });
    debounced.cancel();

    setTimeout(() => {
      done();
    }, 1500);
  });
});
