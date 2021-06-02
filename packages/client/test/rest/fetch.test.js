const fetch = require('node-fetch');
const baseTests = require('@zerosjs/tests/lib/client');

const app = require('../fixture');
const zeros = require('../../index');

describe('fetch REST connector', function () {
  const rest = zeros.rest('http://localhost:8889');
  const client = zeros()
    .configure(rest.fetch(fetch));

  beforeAll(function (done) {
    this.server = app().listen(8889, done);
  });

  afterAll(function (done) {
    this.server.close(done);
  });

  baseTests(client, 'todos');
});
