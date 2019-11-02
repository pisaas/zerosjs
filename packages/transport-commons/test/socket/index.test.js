const assert = require('assert');
const { EventEmitter } = require('events');
const zero = require('@zerojs/zero');

const transSocket = require('../../lib/socket');
const commons = transSocket.socket;

describe('@zerojs/transport-commons', () => {
  let provider;
  let options;
  let app;
  let connection;

  beforeEach(() => {
    connection = { testing: true };
    provider = new EventEmitter();

    options = {
      emit: 'emit',
      done: Promise.resolve(provider),
      socketMap: new WeakMap(),
      getParams () {
        return connection;
      }
    };
    app = zero()
      .configure(commons(options))
      .use('/myservice', {
        get (id, params) {
          return Promise.resolve({ id, params });
        },

        create (data, params) {
          return Promise.resolve(Object.assign({ params }, data));
        }
      });

    return options.done;
  });

  it('`connection` event', done => {
    const socket = new EventEmitter();

    app.once('connection', data => {
      assert.strictEqual(connection, data);
      done();
    });

    provider.emit('connection', socket);
  });

  describe('method name based socket events', () => {
    it('.get without params', done => {
      const socket = new EventEmitter();

      provider.emit('connection', socket);

      socket.emit('get', 'myservice', 10, (error, result) => {
        try {
          assert.ok(!error);
          assert.deepStrictEqual(result, {
            id: 10,
            params: Object.assign({
              query: {},
              route: {},
              connection
            }, connection)
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('.get with invalid service name and arguments', done => {
      const socket = new EventEmitter();

      provider.emit('connection', socket);

      socket.emit('get', null, (error) => {
        assert.strictEqual(error.name, 'NotFound');
        assert.strictEqual(error.message, `Service 'null' not found`);
        done();
      });
    });

    it('.create with params', done => {
      const socket = new EventEmitter();
      const data = {
        test: 'data'
      };

      provider.emit('connection', socket);

      socket.emit('create', 'myservice', data, {
        fromQuery: true
      }, (error, result) => {
        try {
          const params = Object.assign({
            query: { fromQuery: true },
            route: {},
            connection
          }, connection);

          assert.ok(!error);
          assert.deepStrictEqual(result, Object.assign({ params }, data));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('legacy method socket event format', () => {
    it('legacy `authenticate`', done => {
      const socket = new EventEmitter();
      const data = {
        test: 'data'
      };

      app.set('defaultAuthentication', 'myservice');
      provider.emit('connection', socket);

      socket.emit('authenticate', data, (error, result) => {
        try {
          const params = Object.assign({
            query: {},
            route: {},
            connection
          }, connection);

          assert.ok(!error);
          assert.deepStrictEqual(result, Object.assign({ params }, data));
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('.get without params', done => {
      const socket = new EventEmitter();

      provider.emit('connection', socket);

      socket.emit('myservice::get', 10, (error, result) => {
        try {
          assert.ok(!error);
          assert.deepStrictEqual(result, {
            id: 10,
            params: Object.assign({
              connection,
              query: {},
              route: {}
            }, connection)
          });
          app.emit('disconnect', socket);
        } catch (e) {
          done(e);
        }
      });

      app.once('disconnect', () => done());
    });

    it('.create with params', done => {
      const socket = new EventEmitter();
      const data = {
        test: 'data'
      };

      provider.emit('connection', socket);

      socket.emit('myservice::create', data, {
        fromQuery: true
      }, (error, result) => {
        const params = Object.assign({
          query: { fromQuery: true },
          route: {},
          connection
        }, connection);

        try {
          assert.ok(!error);
          assert.deepStrictEqual(result, Object.assign({ params }, data));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
