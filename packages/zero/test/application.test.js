const assert = require('assert');
const Proto = require('uberproto');
const zero = require('../lib');

describe('Zero application', () => {
  it('adds an ES module `default` export', () => {
    assert.strictEqual(zero, zero.default);
  });

  it('initializes', () => {
    const app = zero();

    assert.strictEqual(typeof app.use, 'function');
    assert.strictEqual(typeof app.service, 'function');
    assert.strictEqual(typeof app.services, 'object');
  });

  it('sets the version on main and app instance', () => {
    const app = zero();

    assert.ok(zero.version > '0.0.0');
    assert.ok(app.version > '0.0.0');
  });

  it('is an event emitter', done => {
    const app = zero();
    const original = { hello: 'world' };

    app.on('test', data => {
      assert.deepStrictEqual(original, data);
      done();
    });

    app.emit('test', original);
  });

  it('throws an error for old app.service(path, service)', () => {
    const app = zero();

    try {
      app.service('/test', {});
    } catch (e) {
      assert.strictEqual(e.message, 'Registering a new service with `app.service(path, service)` is no longer supported. Use `app.use(path, service)` instead.');
    }
  });

  it('uses .defaultService if available', () => {
    const app = zero();

    assert.ok(!app.service('/todos/'));

    app.defaultService = function (path) {
      assert.strictEqual(path, 'todos');
      return {
        get (id) {
          return Promise.resolve({
            id, description: `You have to do ${id}!`
          });
        }
      };
    };

    return app.service('/todos/').get('dishes').then(data => {
      assert.deepStrictEqual(data, {
        id: 'dishes',
        description: 'You have to do dishes!'
      });
    });
  });

  it('additionally passes `app` as .configure parameter (#558)', done => {
    zero().configure(function (app) {
      assert.strictEqual(this, app);
      done();
    });
  });

  describe('Services', () => {
    it('calling .use with invalid path throws', () => {
      const app = zero();

      try {
        app.use(null, {});
      } catch (e) {
        assert.strictEqual(e.message, `'null' is not a valid service path.`);
      }

      try {
        app.use({}, {});
      } catch (e) {
        assert.strictEqual(e.message, `'[object Object]' is not a valid service path.`);
      }
    });

    it('calling .use with a non service object throws', () => {
      const app = zero();

      try {
        app.use('/bla', function () {});
        assert.ok(false, 'Should never get here');
      } catch (e) {
        assert.strictEqual(e.message, 'Invalid service object passed for path `bla`');
      }
    });

    it('registers and wraps a new service', () => {
      const dummyService = {
        setup (app, path) {
          this.path = path;
        },

        create (data) {
          return Promise.resolve(data);
        }
      };

      const app = zero().use('/dummy', dummyService);
      const wrappedService = app.service('dummy');

      assert.ok(Proto.isPrototypeOf(wrappedService), 'Service got wrapped as Uberproto object');

      return wrappedService.create({
        message: 'Test message'
      }).then(data => assert.strictEqual(data.message, 'Test message'));
    });

    it('can use a root level service', () => {
      const app = zero().use('/', {
        get (id) {
          return Promise.resolve({ id });
        }
      });

      return app.service('/').get('test')
        .then(result => assert.deepStrictEqual(result, { id: 'test' }));
    });

    it('services can be re-used (#566)', done => {
      const app1 = zero();
      const app2 = zero();

      app2.use('/dummy', {
        create (data) {
          return Promise.resolve(data);
        }
      });

      const dummy = app2.service('dummy');

      dummy.hooks({
        before: {
          create (hook) {
            hook.data.fromHook = true;
          }
        }
      });

      dummy.on('created', data => {
        assert.deepStrictEqual(data, {
          message: 'Hi',
          fromHook: true
        });
        done();
      });

      app1.use('/testing', app2.service('dummy'));

      app1.service('testing').create({ message: 'Hi' });
    });

    it('services conserve Symbols', () => {
      const TEST = Symbol('test');
      const dummyService = {
        [TEST]: true,

        setup (app, path) {
          this.path = path;
        },

        create (data) {
          return Promise.resolve(data);
        }
      };

      const app = zero().use('/dummy', dummyService);
      const wrappedService = app.service('dummy');

      assert.ok(wrappedService[TEST]);
    });

    it('methods conserve Symbols', () => {
      const TEST = Symbol('test');
      const dummyService = {
        setup (app, path) {
          this.path = path;
        },

        create (data) {
          return Promise.resolve(data);
        }
      };

      dummyService.create[TEST] = true;

      const app = zero().use('/dummy', dummyService);
      const wrappedService = app.service('dummy');

      assert.ok(wrappedService.create[TEST]);
    });
  });

  // Copied from the Express tests (without special cases)
  describe('Express app options compatibility', function () {
    describe('.set()', () => {
      it('should set a value', () => {
        var app = zero();
        app.set('foo', 'bar');
        assert.strictEqual(app.get('foo'), 'bar');
      });

      it('should return the app', () => {
        var app = zero();
        assert.strictEqual(app.set('foo', 'bar'), app);
      });

      it('should return the app when undefined', () => {
        var app = zero();
        assert.strictEqual(app.set('foo', undefined), app);
      });
    });

    describe('.get()', () => {
      it('should return undefined when unset', () => {
        var app = zero();
        assert.strictEqual(app.get('foo'), undefined);
      });

      it('should otherwise return the value', () => {
        var app = zero();
        app.set('foo', 'bar');
        assert.strictEqual(app.get('foo'), 'bar');
      });
    });

    describe('.enable()', () => {
      it('should set the value to true', () => {
        var app = zero();
        assert.strictEqual(app.enable('tobi'), app);
        assert.strictEqual(app.get('tobi'), true);
      });
    });

    describe('.disable()', () => {
      it('should set the value to false', () => {
        var app = zero();
        assert.strictEqual(app.disable('tobi'), app);
        assert.strictEqual(app.get('tobi'), false);
      });
    });

    describe('.enabled()', () => {
      it('should default to false', () => {
        var app = zero();
        assert.strictEqual(app.enabled('foo'), false);
      });

      it('should return true when set', () => {
        var app = zero();
        app.set('foo', 'bar');
        assert.strictEqual(app.enabled('foo'), true);
      });
    });

    describe('.disabled()', () => {
      it('should default to true', () => {
        var app = zero();
        assert.strictEqual(app.disabled('foo'), true);
      });

      it('should return false when set', () => {
        var app = zero();
        app.set('foo', 'bar');
        assert.strictEqual(app.disabled('foo'), false);
      });
    });
  });

  describe('.setup', () => {
    it('app.setup calls .setup on all services', () => {
      const app = zero();
      let setupCount = 0;

      app.use('/dummy', {
        setup (appRef, path) {
          setupCount++;
          assert.strictEqual(appRef, app);
          assert.strictEqual(path, 'dummy');
        }
      });

      app.use('/simple', {
        get (id) {
          return Promise.resolve({ id });
        }
      });

      app.use('/dummy2', {
        setup (appRef, path) {
          setupCount++;
          assert.strictEqual(appRef, app);
          assert.strictEqual(path, 'dummy2');
        }
      });

      app.setup();

      assert.ok(app._isSetup);
      assert.strictEqual(setupCount, 2);
    });

    it('registering a service after app.setup will be set up', () => {
      const app = zero();

      app.setup();

      app.use('/dummy', {
        setup (appRef, path) {
          assert.ok(app._isSetup);
          assert.strictEqual(appRef, app);
          assert.strictEqual(path, 'dummy');
        }
      });
    });

    it('calls _setup on a service right away', () => {
      const app = zero();
      let _setup = false;

      app.use('/dummy', {
        get () {},
        _setup (appRef, path) {
          _setup = true;
          assert.strictEqual(appRef, app);
          assert.strictEqual(path, 'dummy');
        }
      });

      assert.ok(_setup);
    });
  });

  describe('providers', () => {
    it('are getting called with a service', () => {
      const app = zero();
      let providerRan = false;

      app.providers.push(function (service, location, options) {
        assert.ok(service.dummy);
        assert.strictEqual(location, 'dummy');
        assert.deepStrictEqual(options, {});
        providerRan = true;
      });

      app.use('/dummy', {
        dummy: true,
        get () {}
      });

      assert.ok(providerRan);

      app.setup();
    });

    it('are getting called with a service and options', () => {
      const app = zero();
      const opts = { test: true };

      let providerRan = false;

      app.providers.push(function (service, location, options) {
        assert.ok(service.dummy);
        assert.strictEqual(location, 'dummy');
        assert.deepStrictEqual(options, opts);
        providerRan = true;
      });

      app.use('/dummy', {
        dummy: true,
        get () {}
      }, opts);

      assert.ok(providerRan);

      app.setup();
    });
  });

  describe('sub apps', () => {
    it('re-registers sub-app services with prefix', done => {
      const app = zero();
      const subApp = zero();

      subApp.use('/service1', {
        get (id) {
          return Promise.resolve({
            id, name: 'service1'
          });
        }
      }).use('/service2', {
        get (id) {
          return Promise.resolve({
            id, name: 'service2'
          });
        },

        create (data) {
          return Promise.resolve(data);
        }
      });

      app.use('/api/', subApp);

      app.service('/api/service2').once('created', data => {
        assert.deepStrictEqual(data, {
          message: 'This is a test'
        });

        subApp.service('service2').once('created', data => {
          assert.deepStrictEqual(data, {
            message: 'This is another test'
          });

          done();
        });

        app.service('api/service2').create({
          message: 'This is another test'
        });
      });

      app.service('/api/service1').get(10).then(data => {
        assert.strictEqual(data.name, 'service1');

        return app.service('/api/service2').get(1);
      }).then(data => {
        assert.strictEqual(data.name, 'service2');

        return subApp.service('service2').create({
          message: 'This is a test'
        });
      });
    });
  });
});
