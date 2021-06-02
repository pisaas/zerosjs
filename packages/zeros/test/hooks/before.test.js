const assert = require('assert');
const zeros = require('../../lib');

describe('`before` hooks', () => {
  describe('function([hook])', () => {
    it('returning a non-hook object throws error', () => {
      const app = zeros().use('/dummy', {
        get (id) {
          return Promise.resolve({ id });
        }
      });
      const service = app.service('dummy');

      service.hooks({
        before: {
          get () {
            return {};
          }
        }
      });

      return service.get(10).catch(e => {
        assert.strictEqual(e.message, 'before hook for \'get\' method returned invalid hook object');
      });
    });

    it('hooks in chain can be replaced', () => {
      const app = zeros().use('/dummy', {
        get (id) {
          return Promise.resolve({
            id, description: `You have to do ${id}`
          });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        before: {
          get: [
            function (hook) {
              return Object.assign({}, hook, {
                modified: true
              });
            },
            function (hook) {
              assert.ok(hook.modified);
            }
          ]
        }
      });

      return service.get('laundry');
    });

    it('.before hooks can return a promise', () => {
      const app = zeros().use('/dummy', {
        get (id, params) {
          assert.ok(params.ran, 'Ran through promise hook');

          return Promise.resolve({
            id: id,
            description: `You have to do ${id}`
          });
        },

        remove () {
          assert.ok(false, 'Should never get here');
        }
      });

      const service = app.service('dummy');

      service.hooks({
        before: {
          get (hook) {
            return new Promise(resolve => {
              hook.params.ran = true;
              resolve();
            });
          },

          remove () {
            return new Promise((resolve, reject) => {
              reject(new Error('This did not work'));
            });
          }
        }
      });

      return service.get('dishes').then(() => service.remove(10))
        .catch(error => {
          assert.strictEqual(error.message, 'This did not work');
        });
    });

    it('.before hooks do not need to return anything', () => {
      const app = zeros().use('/dummy', {
        get (id, params) {
          assert.ok(params.ran, 'Ran through promise hook');

          return Promise.resolve({
            id: id,
            description: `You have to do ${id}`
          });
        },

        remove () {
          assert.ok(false, 'Should never get here');
        }
      });

      const service = app.service('dummy');

      service.hooks({
        before: {
          get (hook) {
            hook.params.ran = true;
          },

          remove () {
            throw new Error('This did not work');
          }
        }
      });

      return service.get('dishes').then(() => service.remove(10))
        .catch(error => {
          assert.strictEqual(error.message, 'This did not work');
        });
    });

    it('.before hooks can set hook.result which will skip service method', () => {
      const app = zeros().use('/dummy', {
        get (id) {
          assert.ok(false, 'This should never run');
          return Promise.resolve({ id });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        before: {
          get (hook) {
            hook.result = {
              id: hook.id,
              message: 'Set from hook'
            };
          }
        }
      });

      return service.get(10, {}).then(data => {
        assert.deepStrictEqual(data, {
          id: 10,
          message: 'Set from hook'
        });
      });
    });
  });

  describe('function(hook, next)', () => {
    it('gets mixed into a service and modifies data', () => {
      const dummyService = {
        create (data, params) {
          assert.deepStrictEqual(data, {
            some: 'thing',
            modified: 'data'
          }, 'Data modified');

          assert.deepStrictEqual(params, {
            modified: 'params'
          }, 'Params modified');

          return Promise.resolve(data);
        }
      };

      const app = zeros().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        before: {
          create (hook) {
            assert.strictEqual(hook.type, 'before');

            hook.data.modified = 'data';

            Object.assign(hook.params, {
              modified: 'params'
            });

            return hook;
          }
        }
      });

      return service.create({ some: 'thing' }).then(data => {
        assert.deepStrictEqual(data, {
          some: 'thing',
          modified: 'data'
        }, 'Data got modified');
      });
    });

    it('contains the app object at hook.app', () => {
      const someServiceConfig = {
        create (data, params, callback) {
          return Promise.resolve(data);
        }
      };

      const app = zeros().use('/some-service', someServiceConfig);
      const someService = app.service('some-service');

      someService.hooks({
        before: {
          create (hook) {
            hook.data.appPresent = typeof hook.app !== 'undefined';
            assert.strictEqual(hook.data.appPresent, true);

            return hook;
          }
        }
      });

      return someService.create({ some: 'thing' }).then(data => {
        assert.deepStrictEqual(data, {
          some: 'thing',
          appPresent: true
        }, 'App object was present');
      });
    });

    it('passes errors', () => {
      const dummyService = {
        update () {
          assert.ok(false, 'Never should be called');
        }
      };

      const app = zeros().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        before: {
          update () {
            throw new Error('You are not allowed to update');
          }
        }
      });

      return service.update(1, {}).catch(error => {
        assert.ok(error, 'Got an error');
        assert.strictEqual(error.message, 'You are not allowed to update', 'Got error message');
      });
    });

    it('calling back with no arguments uses the old ones', () => {
      const dummyService = {
        remove (id, params) {
          assert.strictEqual(id, 1, 'Got id');
          assert.deepStrictEqual(params, { my: 'param' });

          return Promise.resolve({ id });
        }
      };

      const app = zeros().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        before: {
          remove (hook) {
            return hook;
          }
        }
      });

      return service.remove(1, { my: 'param' });
    });

    it('adds .hooks() and chains multiple hooks for the same method', () => {
      const dummyService = {
        create (data, params) {
          assert.deepStrictEqual(data, {
            some: 'thing',
            modified: 'second data'
          }, 'Data modified');

          assert.deepStrictEqual(params, {
            modified: 'params'
          }, 'Params modified');

          return Promise.resolve(data);
        }
      };

      const app = zeros().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        before: {
          create (hook) {
            hook.params.modified = 'params';

            return hook;
          }
        }
      });

      service.hooks({
        before: {
          create (hook) {
            hook.data.modified = 'second data';

            return hook;
          }
        }
      });

      return service.create({ some: 'thing' });
    });

    it('chains multiple before hooks using array syntax', () => {
      const dummyService = {
        create (data, params) {
          assert.deepStrictEqual(data, {
            some: 'thing',
            modified: 'second data'
          }, 'Data modified');

          assert.deepStrictEqual(params, {
            modified: 'params'
          }, 'Params modified');

          return Promise.resolve(data);
        }
      };

      const app = zeros().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        before: {
          create: [
            function (hook) {
              hook.params.modified = 'params';

              return hook;
            },
            function (hook) {
              hook.data.modified = 'second data';

              return hook;
            }
          ]
        }
      });

      return service.create({ some: 'thing' });
    });

    it('.before hooks run in the correct order (#13)', () => {
      const app = zeros().use('/dummy', {
        get (id, params, callback) {
          assert.deepStrictEqual(params.items, ['first', 'second', 'third']);

          return Promise.resolve({
            id: id,
            items: []
          });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        before: {
          get (hook) {
            hook.params.items = ['first'];

            return hook;
          }
        }
      });

      service.hooks({
        before: {
          get: [
            function (hook) {
              hook.params.items.push('second');

              return hook;
            },
            function (hook) {
              hook.params.items.push('third');

              return hook;
            }
          ]
        }
      });

      return service.get(10);
    });

    it('before all hooks (#11)', () => {
      const app = zeros().use('/dummy', {
        get (id, params) {
          assert.ok(params.beforeAllObject);
          assert.ok(params.beforeAllMethodArray);

          return Promise.resolve({
            id: id,
            items: []
          });
        },

        find (params) {
          assert.ok(params.beforeAllObject);
          assert.ok(params.beforeAllMethodArray);

          return Promise.resolve([]);
        }
      });

      const service = app.service('dummy');

      service.hooks({
        before: {
          all (hook) {
            hook.params.beforeAllObject = true;

            return hook;
          }
        }
      });

      service.hooks({
        before: [
          function (hook) {
            hook.params.beforeAllMethodArray = true;

            return hook;
          }
        ]
      });

      return service.find();
    });

    it('before hooks have service as context and keep it in service method (#17)', () => {
      const app = zeros().use('/dummy', {
        number: 42,
        get (id, params) {
          return Promise.resolve({
            id: id,
            number: this.number,
            test: params.test
          });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        before: {
          get (hook) {
            hook.params.test = this.number + 2;

            return hook;
          }
        }
      });

      return service.get(10).then(data => {
        assert.deepStrictEqual(data, {
          id: 10,
          number: 42,
          test: 44
        });
      });
    });
  });
});
