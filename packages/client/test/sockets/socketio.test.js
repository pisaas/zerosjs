const io = require('socket.io-client');
const socketio = require('@zerosjs/socketio');
const baseTests = require('@zerosjs/tests/lib/client');

const app = require('../fixture');
const zeros = require('../../');

describe('Socket.io connector', function () {
  const socket = io('http://localhost:9988');
  const client = zeros()
    .configure(zeros.socketio(socket));

  beforeAll(function (done) {
    this.server = app(function () {
      this.configure(socketio());
    }).listen(9988, done);
  });

  afterAll(function (done) {
    socket.once('disconnect', () => {
      this.server.close();
      done();
    });
    socket.disconnect();
  });

  baseTests(client, 'todos');
});
