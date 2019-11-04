module.exports.sockets = {
  transports: [ 'websocket' ],
  adapter: {
    name: 'socket.io-redis',
    url: 'redis://localhost:6379/0'
  }
};
