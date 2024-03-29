const debug = require('debug')('@zerosjs/socketio/middleware');

exports.disconnect = (app, getParams) => (socket, next) => {
  socket.once('disconnect', () => app.emit('disconnect', getParams(socket)));
  next();
};

exports.params = (app, socketMap) => (socket, next) => {
  socket.zeros = {
    provider: 'socketio',
    headers: socket.handshake.headers
  };

  socketMap.set(socket.zeros, socket);

  next();
};

exports.authentication = (app, getParams, settings = {}) => (socket, next) => {
  const service = app.defaultAuthentication ? app.defaultAuthentication(settings.service) : null;

  if (service === null) {
    return next();
  }

  const { authStrategies = [] } = service.configuration;

  if (authStrategies.length === 0) {
    return next();
  }

  service.parse(socket.handshake, null, ...authStrategies)
    .then(async authentication => {
      if (authentication) {
        debug('Parsed authentication from HTTP header', authentication);
        socket.zeros.authentication = authentication;
        await service.create(authentication, {
          provider: 'socketio',
          connection: getParams(socket)
        });
      }

      next();
    }).catch(next);
};
