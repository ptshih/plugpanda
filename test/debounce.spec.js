const _ = require('lodash');
const debounce = require('../lib/debounce');
const Promise = require('bluebird');

describe('Debounce', function() {
  let obj;

  beforeEach(function() {
    obj = {
      foo: 'bar',

      // A function that returns a thenable
      thenable: function(text) {
        assert.strictEqual(this.foo, 'bar');
        return new Promise((resolve) => {
          resolve(text);
        });
      },
    };
  });

  it('should debounce', function(done) {
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

  it('should flush', function(done) {
    // Create debounced function that returns a thenable
    const debounced = debounce(obj.thenable.bind(obj), 5000);
    const begin = new Date().getTime();

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
      const end = new Date().getTime();
      const duration = end - begin;
      assert.ok(duration >= 500 && duration < 5000);
      done();
    });

    // Flush at 500ms instead of waiting 5000ms
    setTimeout(() => {
      debounced.flush();
    }, 500);
  });

  it('should cancel', function(done) {
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
