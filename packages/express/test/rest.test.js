const assert = require('assert');
const axios = require('axios');

const zero = require('@zerojs/zero');
const { BadRequest } = require('@zerojs/errors');
const { Service } = require('@zerojs/tests/lib/fixture');
const { crud } = require('@zerojs/tests/lib/crud');

const expressify = require('../lib');
const { rest } = expressify;

describe('@zerojs/express/rest provider', () => {
  describe('base functionality', () => {
    it('throws an error if you did not expressify', () => {
      const app = zero();

      try {
        app.configure(rest());
        assert.ok(false, 'Should never get here');
      } catch (e) {
        assert.strictEqual(e.message, '@zerojs/express/rest needs an Express compatible app. Feathers apps have to wrapped with zero-express first.');
      }
    });

    it('throws an error for incompatible Feathers version', () => {
      try {
        const app = expressify(zero());

        app.version = '2.9.9';
        app.configure(rest());

        assert.ok(false, 'Should never get here');
      } catch (e) {
        assert.strictEqual(e.message, '@zerojs/express/rest requires an instance of a Feathers application version 3.x or later (got 2.9.9)');
      }
    });

    it('lets you set the handler manually', () => {
      const app = expressify(zero());
      const formatter = function (req, res) {
        res.format({
          'text/plain': function () {
            res.end(`The todo is: ${res.data.description}`);
          }
        });
      };

      app.configure(rest(formatter))
        .use('/todo', {
          get (id) {
            return Promise.resolve({
              description: `You have to do ${id}`
            });
          }
        });

      let server = app.listen(4776);

      return axios.get('http://localhost:4776/todo/dishes')
        .then(res => {
          assert.strictEqual(res.data, 'The todo is: You have to do dishes');
        })
        .then(() => server.close());
    });

    it('lets you set no handler', () => {
      const app = expressify(zero());
      const data = { fromHandler: true };

      app.configure(rest(null))
        .use('/todo', {
          get (id) {
            return Promise.resolve({
              description: `You have to do ${id}`
            });
          }
        })
        .use((req, res) => res.json(data));

      let server = app.listen(5775);

      return axios.get('http://localhost:5775/todo-handler/dishes')
        .then(res => assert.deepStrictEqual(res.data, data))
        .then(() => server.close());
    });
  });

  describe('CRUD', () => {
    let server;
    let app;

    beforeAll(function () {
      app = expressify(zero())
        .configure(rest(rest.formatter))
        .use(expressify.json())
        .use('codes', {
          get (id, params) {
            return Promise.resolve({ id });
          },

          create (data) {
            return Promise.resolve(data);
          }
        })
        .use('/', Service)
        .use('todo', Service);

      server = app.listen(4777, () => app.use('tasks', Service));
    });

    afterAll(done => server.close(done));

    crud('Services', 'todo', 4777);
    crud('Root Service', '/', 4777);
    crud('Dynamic Services', 'tasks', 4777);

    describe('res.hook', () => {
      const convertHook = hook => {
        const result = Object.assign({}, hook);

        delete result.service;
        delete result.app;
        delete result.error;

        return result;
      };

      it('sets the actual hook object in res.hook', () => {
        const params = {
          route: {},
          query: { test: 'param' },
          provider: 'rest'
        };

        app.use('/hook', {
          get (id) {
            return Promise.resolve({
              description: `You have to do ${id}`
            });
          }
        }, function (req, res, next) {
          res.data = convertHook(res.hook);

          next();
        });

        app.service('hook').hooks({
          after (hook) {
            hook.addedProperty = true;
          }
        });

        return axios.get('http://localhost:4777/hook/dishes?test=param')
          .then(res => {
            const paramsWithHeaders = {
              ...params,
              headers: res.data.params.headers
            };

            assert.deepStrictEqual(res.data, {
              id: 'dishes',
              params: paramsWithHeaders,
              arguments: [
                'dishes', paramsWithHeaders
              ],
              type: 'after',
              method: 'get',
              path: 'hook',
              result: { description: 'You have to do dishes' },
              addedProperty: true
            });
          });
      });

      it('can use hook.dispatch', () => {
        app.use('/hook-dispatch', {
          get (id) {
            return Promise.resolve({});
          }
        });

        app.service('hook-dispatch').hooks({
          after (hook) {
            hook.dispatch = {
              id: hook.id,
              fromDispatch: true
            };
          }
        });

        return axios.get('http://localhost:4777/hook-dispatch/dishes')
          .then(res => {
            assert.deepStrictEqual(res.data, {
              id: 'dishes',
              fromDispatch: true
            });
          });
      });

      it('allows to set statusCode in a hook', () => {
        app.use('/hook-status', {
          get (id) {
            return Promise.resolve({});
          }
        });

        app.service('hook-status').hooks({
          after (hook) {
            hook.statusCode = 206;
          }
        });

        return axios.get('http://localhost:4777/hook-status/dishes')
          .then(res => assert.strictEqual(res.status, 206));
      });

      it('sets the hook object in res.hook on error', () => {
        const params = {
          route: {},
          query: {},
          provider: 'rest'
        };

        app.use('/hook-error', {
          get () {
            return Promise.reject(new Error('I blew up'));
          }
        }, function (error, req, res, next) {
          res.status(500);
          res.json({
            hook: convertHook(res.hook),
            error: {
              message: error.message
            }
          });
        });

        return axios('http://localhost:4777/hook-error/dishes')
          .catch(error => {
            const { data } = error.response;
            const paramsWithHeaders = {
              ...params,
              headers: data.hook.params.headers
            };
            assert.deepStrictEqual(error.response.data, {
              hook: {
                id: 'dishes',
                params: paramsWithHeaders,
                arguments: ['dishes', paramsWithHeaders ],
                type: 'error',
                method: 'get',
                path: 'hook-error',
                original: data.hook.original
              },
              error: { message: 'I blew up' }
            });
          });
      });
    });
  });

  describe('middleware', () => {
    it('sets service parameters and provider type', () => {
      let service = {
        get (id, params) {
          return Promise.resolve(params);
        }
      };

      let server = expressify(zero())
        .configure(rest(rest.formatter))
        .use(function (req, res, next) {
          assert.ok(req.zero, 'Feathers object initialized');
          req.zero.test = 'Happy';
          next();
        })
        .use('service', service)
        .listen(4778);

      return axios.get('http://localhost:4778/service/bla?some=param&another=thing')
        .then(res => {
          let expected = {
            headers: res.data.headers,
            test: 'Happy',
            provider: 'rest',
            route: {},
            query: {
              some: 'param',
              another: 'thing'
            }
          };

          assert.ok(res.status === 200, 'Got OK status code');
          assert.deepStrictEqual(res.data, expected, 'Got params object back');
        })
        .then(() => server.close());
    });

    it('Lets you configure your own middleware before the handler (#40)', () => {
      const data = {
        description: 'Do dishes!',
        id: 'dishes'
      };
      const app = expressify(zero());

      app.use(function defaultContentTypeMiddleware (req, res, next) {
        req.headers['content-type'] = req.headers['content-type'] || 'application/json';
        next();
      })
        .configure(rest(rest.formatter))
        .use(expressify.json())
        .use('/todo', {
          create (data) {
            return Promise.resolve(data);
          }
        });

      const server = app.listen(4775);
      const options = {
        url: 'http://localhost:4775/todo',
        method: 'post',
        data,
        headers: {
          'content-type': ''
        }
      };

      return axios(options)
        .then(res => {
          assert.deepStrictEqual(res.data, data);
          server.close();
        });
    });

    it('allows middleware before and after a service', () => {
      const app = expressify(zero());

      app.configure(rest())
        .use(expressify.json())
        .use('/todo', function (req, res, next) {
          req.body.before = ['before first'];
          next();
        }, function (req, res, next) {
          req.body.before.push('before second');
          next();
        }, {
            create (data) {
              return Promise.resolve(data);
            }
          }, function (req, res, next) {
            res.data.after = ['after first'];
            next();
          }, function (req, res, next) {
            res.data.after.push('after second');
            next();
          });

      const server = app.listen(4776);

      return axios.post('http://localhost:4776/todo', { text: 'Do dishes' })
        .then(res => {
          assert.deepStrictEqual(res.data, {
            text: 'Do dishes',
            before: ['before first', 'before second'],
            after: ['after first', 'after second']
          });
        })
        .then(() => server.close());
    });

    it('allows middleware arrays before and after a service', () => {
      const app = expressify(zero());

      app.configure(rest())
        .use(expressify.json())
        .use('/todo', [function (req, res, next) {
          req.body.before = ['before first'];
          next();
        }, function (req, res, next) {
          req.body.before.push('before second');
          next();
        }], {
            create (data) {
              return Promise.resolve(data);
            }
          }, [function (req, res, next) {
            res.data.after = ['after first'];
            next();
          }], function (req, res, next) {
            res.data.after.push('after second');
            next();
          });

      const server = app.listen(4776);

      return axios.post('http://localhost:4776/todo', { text: 'Do dishes' })
        .then(res => {
          assert.deepStrictEqual(res.data, {
            text: 'Do dishes',
            before: ['before first', 'before second'],
            after: ['after first', 'after second']
          });
        })
        .then(() => server.close());
    });

    it('allows an array of middleware without a service', () => {
      const app = expressify(zero());
      const middlewareArray = [
        function (req, res, next) {
          res.data = ['first'];
          next();
        }, function (req, res, next) {
          res.data.push('second');
          next();
        }, function (req, res, next) {
          res.data.push(req.body.text);
          res.status(200).json(res.data);
        }];
      app.configure(rest())
        .use(expressify.json())
        .use('/array-middleware', middlewareArray);

      const server = app.listen(4776);

      return axios.post('http://localhost:4776/array-middleware', { text: 'Do dishes' })
        .then(res => {
          assert.deepStrictEqual(res.data, ['first', 'second', 'Do dishes']);
        })
        .then(() => server.close());
    });

    it('formatter does nothing when there is no res.data', () => {
      const data = { message: 'It worked' };
      const app = expressify(zero()).use('/test',
        rest.formatter,
        (req, res) => res.json(data)
      );

      const server = app.listen(7988);

      return axios.get('http://localhost:7988/test')
        .then(res => assert.deepStrictEqual(res.data, data))
        .then(() => server.close());
    });
  });

  describe('HTTP status codes', () => {
    let app;
    let server;

    beforeAll(function () {
      app = expressify(zero())
        .configure(rest(rest.formatter))
        .use('todo', {
          get (id) {
            return Promise.resolve({
              description: `You have to do ${id}`
            });
          },

          patch () {
            return Promise.reject(new Error('Not implemented'));
          },

          find () {
            return Promise.resolve(null);
          }
        });

      app.use(function (req, res, next) {
        if (typeof res.data !== 'undefined') {
          next(new Error('Should never get here'));
        } else {
          next();
        }
      });

      // Error handler
      app.use(function (error, req, res, next) {
        if (res.statusCode < 400) {
          res.status(500);
        }

        res.json({ message: error.message });
      });

      server = app.listen(4780);
    });

    afterAll(done => server.close(done));

    it('throws a 405 for undefined service methods and sets Allow header (#99)', () => {
      return axios.get('http://localhost:4780/todo/dishes')
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code for .get');
          assert.deepStrictEqual(res.data, {
            description: 'You have to do dishes'
          }, 'Got expected object');

          return axios.post('http://localhost:4780/todo');
        })
        .catch(error => {
          assert.strictEqual(error.response.headers.allow, 'GET,PATCH');
          assert.ok(error.response.status === 405, 'Got 405 for .create');
          assert.deepStrictEqual(error.response.data, {
            message: 'Method `create` is not supported by this endpoint.'
          }, 'Error serialized as expected');
        });
    });

    it('throws a 404 for undefined route', () => {
      return axios.get('http://localhost:4780/todo/foo/bar')
        .catch(error => {
          assert.ok(error.response.status === 404, 'Got Not Found code');
        });
    });

    it('empty response sets 204 status codes, does not run other middleware (#391)', () => {
      return axios.get('http://localhost:4780/todo')
        .then(res => {
          assert.ok(res.status === 204, 'Got empty status code');
        });
    });
  });

  describe('route parameters', () => {
    let server;
    let app;

    beforeAll(() => {
      app = expressify(zero())
        .configure(rest())
        .use('/:appId/:id/todo', {
          get (id, params) {
            if (params.query.error) {
              return Promise.reject(new BadRequest('Not good'));
            }

            return Promise.resolve({
              id,
              route: params.route
            });
          }
        })
        .use(expressify.errorHandler());

      server = app.listen(6880);
    });

    afterAll(done => server.close(done));

    it('adds route params as `params.route` and allows id property (#76, #407)', () => {
      const expected = {
        id: 'dishes',
        route: {
          appId: 'theApp',
          id: 'myId'
        }
      };

      return axios.get(`http://localhost:6880/theApp/myId/todo/${expected.id}`)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          assert.deepStrictEqual(expected, res.data);
        });
    });

    it('properly serializes error for nested routes (#1096)', () => {
      return axios.get(`http://localhost:6880/theApp/myId/todo/test?error=true`)
        .catch(error => {
          const { response } = error;

          assert.strictEqual(response.status, 400);
          assert.deepStrictEqual(response.data, {
            name: 'BadRequest',
            message: 'Not good',
            code: 400,
            className: 'bad-request',
            errors: {}
          });
        });
    });
  });

  describe('Custom methods', () => {
    let server;
    let app;

    beforeAll(() => {
      app = expressify(zero())
        .configure(rest())
        .use(expressify.json())
        .use('/todo', {
          get (id) {
            return id;
          },
          // httpMethod is usable as a decorator: @httpMethod('POST', '/:__zeroId/custom-path')
          custom: rest.httpMethod('POST')(zero.activateHooks(['id', 'data', 'params'])(
            (id, data, params = {}) => {
              return Promise.resolve({
                id,
                data
              });
            }
          )),
          other: rest.httpMethod('PATCH', ':__zeroId/second-method')(
            zero.activateHooks(['id', 'data', 'params'])(
              (id, data, params = {}) => {
                return Promise.resolve({
                  id,
                  data
                });
              }
            )
          )
        });

      server = app.listen(4781);
    });

    afterAll(done => server.close(done));

    it('works with custom methods', () => {
      return axios.post('http://localhost:4781/todo/42/custom', { text: 'Do dishes' })
        .then(res => {
          assert.equal(res.headers.allow, 'GET,POST,PATCH');
          assert.deepEqual(res.data, {
            id: '42',
            data: { text: 'Do dishes' }
          });
        });
    });

    it('works with custom methods - with route', () => {
      return axios.patch('http://localhost:4781/todo/12/second-method', { text: 'Hmm' })
        .then(res => {
          assert.equal(res.headers.allow, 'GET,POST,PATCH');
          assert.deepEqual(res.data, {
            id: '12',
            data: { text: 'Hmm' }
          });
        });
    });
  });
});
