const primus = require('@zerosjs/primus');
const baseTests = require('@zerosjs/tests/lib/client');

const app = require('../fixture');
const zeros = require('../../');

describe('Primus connector', function () {
  const client = zeros();

  let socket;

  beforeAll(function (done) {
    this.server = app(function () {
      this.configure(primus({
        transformer: 'websockets'
      }, function (primus) {
        socket = new primus.Socket('http://localhost:12012');
        client.configure(zeros.primus(socket));
      }));
    }).listen(12012, done);
  });

  afterAll(function () {
    socket.socket.close();
    this.server.close();
  });

  baseTests(client, 'todos');
});
