const zeros = require('@zerosjs/zeros');
const errors = require('@zerosjs/errors');
const authentication = require('@zerosjs/authentication-client');
const rest = require('@zerosjs/rest-client');
const socketio = require('@zerosjs/socketio-client');
const primus = require('@zerosjs/primus-client');

Object.assign(zeros, {
  errors,
  socketio,
  primus,
  rest,
  authentication
});

module.exports = zeros;
