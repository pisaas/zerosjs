const fetch = require('node-fetch');
const zeros = require('@zerosjs/zeros');
const rest = require('../lib/index');
const assert = require('assert');

const init = require('../lib');

describe('REST client tests', function () {
  it('is built correctly', () => {
    const transports = init();

    assert.strictEqual(typeof init, 'function');
  });

  it('exports default', () => {
    assert.strictEqual(init.default, init);
  });

  it('base errors (backwards compatibility)', () => {
    const { Base } = init();
    const service = new Base({ name: 'test' });

    return service.get().catch(error => {
      assert.strictEqual(error.message, `id for 'get' can not be undefined`);

      return service.update();
    }).catch(error => {
      assert.strictEqual(error.message, `id for 'update' can not be undefined, only 'null' when updating multiple entries`);

      return service.patch();
    }).catch(error => {
      assert.strictEqual(error.message, `id for 'patch' can not be undefined, only 'null' when updating multiple entries`);

      return service.remove();
    }).catch(error => {
      assert.strictEqual(error.message, `id for 'remove' can not be undefined, only 'null' when removing multiple entries`);
    });
  });

  it('throw errors when no connection is provided', () => {
    const transports = init();

    try {
      transports.fetch();
    } catch (e) {
      assert.strictEqual(e.message, 'fetch has to be provided to zeros-rest');
    }
  });

  it('app has the rest attribute', () => {
    const app = zeros();

    app.configure(rest('http://localhost:8889').fetch(fetch));

    assert.ok(app.rest);
  });

  it('throws an error when configured twice', () => {
    const app = zeros();

    app.configure(rest('http://localhost:8889').fetch(fetch));

    try {
      app.configure(rest('http://localhost:8889').fetch(fetch));
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.strictEqual(e.message, 'Only one default client provider can be configured');
    }
  });

  it('errors when id property for get, patch, update or remove is undefined', () => {
    const app = zeros().configure(rest('http://localhost:8889')
      .fetch(fetch));

    const service = app.service('todos');

    return service.get().catch(error => {
      assert.strictEqual(error.message, `An id must be provided to the 'get' method`);

      return service.remove();
    }).catch(error => {
      assert.strictEqual(error.message, `An id must be provided to the 'remove' method`);

      return service.update();
    }).catch(error => {
      assert.strictEqual(error.message, `An id must be provided to the 'update' method`);

      return service.patch();
    }).catch(error => {
      assert.strictEqual(error.message, `An id must be provided to the 'patch' method`);
    });
  });
});
