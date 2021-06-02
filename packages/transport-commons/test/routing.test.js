const assert = require('assert');
const zeros = require('@zerosjs/zeros');
const { routing, ROUTER } = require('../lib/routing');

describe('app.router', () => {
  let app;

  beforeEach(() => {
    app = zeros().configure(routing());

    app.use('/my/service', {
      get (id) {
        return Promise.resolve({ id });
      }
    });
  });

  it('does nothing when configured twice', () => {
    zeros().configure(routing()).configure(routing());
  });

  it('has app.lookup and ROUTER symbol', () => {
    assert.strictEqual(typeof app.lookup, 'function');
    // @ts-ignore
    assert.ok(app[ROUTER]);
  });

  it('returns null when nothing is found', () => {
    const result = app.lookup('me/service');

    assert.strictEqual(result, null);
  });

  it('returns null for invalid service path', () => {
    assert.strictEqual(app.lookup(null), null);
    // @ts-ignore
    assert.strictEqual(app.lookup({}), null);
  });

  it('can look up and strips slashes', () => {
    const result = app.lookup('my/service');

    assert.strictEqual(result.service, app.service('/my/service'));
  });

  it('can look up with id', () => {
    const result = app.lookup('/my/service/1234');

    assert.strictEqual(result.service, app.service('/my/service'));
    assert.deepStrictEqual(result.params, {
      __id: '1234'
    });
  });

  it('can look up with params, id and special characters', () => {
    const path = '/test/:first/my/:second';

    app.use(path, {
      get (id) {
        return Promise.resolve({ id });
      }
    });

    const result = app.lookup('/test/me/my/::special/testing');

    assert.strictEqual(result.service, app.service(path));
    assert.deepStrictEqual(result.params, {
      __id: 'testing',
      first: 'me',
      second: '::special'
    });
  });
});
