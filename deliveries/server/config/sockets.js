module.exports.sockets = {
  type: 'socketio',
  
  transports: [ 'websocket' ],
  adapter: 'socket.io-redis',
  url: 'redis://localhost:6379/0'
};
