const socketio = require('socket.io');
const Proto = require('uberproto');
const http = require('http');
const debug = require('debug')('@zerosjs/socketio');

const transport = require('./transport');
const middleware = require('./middleware');

function configureSocketio (port, options, config) {
  if (typeof port !== 'number') {
    config = options;
    options = port;
    port = null;
  }

  if (typeof options !== 'object') {
    config = options;
    options = {};
  }

  return function (app) {
    // Function that gets the connection
    const getParams = socket => socket.zeros;
    // A mapping from connection to socket instance
    const socketMap = new WeakMap();

    // Promise that resolves with the Socket.io `io` instance
    // when `setup` has been called (with a server)
    const done = new Promise(resolve => {
      Proto.mixin({
        listen (...args) {
          if (typeof this._super === 'function') {
            // If `listen` already exists
            // usually the case when the app has been expressified
            return this._super(...args);
          }

          const server = http.createServer();

          this.setup(server);

          return server.listen(...args);
        },

        setup (server) {
          if (!this.io) {
            const io = this.io = socketio.listen(port || server, options);

            io.use(middleware.disconnect(app, getParams));
            io.use(middleware.params(app, socketMap));
            io.use(middleware.authentication(app, getParams));

            // In Zeros it is easy to hit the standard Node warning limit
            // of event listeners (e.g. by registering 10 services).
            // So we set it to a higher number. 64 should be enough for everyone.
            io.sockets.setMaxListeners(64);
          }

          if (typeof config === 'function') {
            debug('Calling SocketIO configuration function');
            config.call(this, this.io);
          }

          resolve(this.io);

          return this._super.apply(this, arguments);
        }
      }, app);
    });

    app.configure(transport({
      done,
      socketMap,
      getParams,
      emit: 'emit'
    }));
  };
}

module.exports = configureSocketio;
module.exports.default = configureSocketio;
