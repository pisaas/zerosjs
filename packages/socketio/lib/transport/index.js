const { channels } = require('@feathersjs/transport-commons/lib/channels');
const { routing } = require('@feathersjs/transport-commons/lib/routing');
const { getDispatcher, runMethod } = require('./utils');

const debug = require('debug')('@zero/socketio/transport');

module.exports = function socketTransport ({ done, emit, socketMap, socketKey, getParams }) {
  return (app) => {
    const leaveChannels = (connection) => {
      const { channels } = app;

      if (channels.length) {
        app.channel(app.channels).leave(connection);
      }
    };

    app.configure(channels());
    app.configure(routing());

    app.on('publish', getDispatcher(emit, socketMap, socketKey));
    app.on('disconnect', leaveChannels);
    app.on('logout', (_authResult, params) => {
      const { connection } = params;

      if (connection) {
        leaveChannels(connection);
      }
    });

    // `connection` event
    done.then(provider => provider.on('connection', (connection) =>
      app.emit('connection', getParams(connection)))
    );

    // `socket.emit('methodName', 'serviceName', ...args)` handlers
    done.then(provider => provider.on('connection', (connection) => {
      for (const method of app.methods) {
        connection.on(method, (...args) => {
          const path = args.shift();

          debug(`Got '${method}' call for service '${path}'`);
          runMethod(app, getParams(connection), path, method, args);
        });
      }

      connection.on('authenticate', (...args) => {
        if (app.get('defaultAuthentication')) {
          debug('Got legacy authenticate event');
          runMethod(app, getParams(connection), app.get('defaultAuthentication'), 'create', args);
        }
      });

      connection.on('logout', (callback) => {
        if (app.get('defaultAuthentication')) {
          debug('Got legacy authenticate event');
          runMethod(app, getParams(connection), app.get('defaultAuthentication'), 'remove', [ null, {}, callback ]);
        }
      });
    }));

    // Legacy `socket.emit('serviceName::methodName', ...args)` handlers
    app.mixins.push((service, path) => done.then(provider => {
      provider.on('connection', (socket) => {
        const methods = app.methods.filter(current =>
          // @ts-ignore
          typeof service[current] === 'function'
        );

        for (const method of methods) {
          const eventName = `${path}::${method}`;

          socket.on(eventName, (...args) => {
            debug(`Got legacy method call '${eventName}'`);
            runMethod(app, getParams(socket), path, method, args);
          });
        }
      });
    }));
  };
}
