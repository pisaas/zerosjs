const axios = require('axios');
const zeros = require('@zerosjs/zeros');
const express = require('@zerosjs/express');
const rest = require('@zerosjs/rest-client');

const authClient = require('../../lib');
const getApp = require('./fixture');
const commonTests = require('./commons');

describe('@zerosjs/authentication-client Express integration', () => {
  let app;
  let server;

  beforeAll(() => {
    const restApp = express.default(zeros())
      .use(express.json())
      .configure(express.rest())
      .use(express.parseAuthentication('jwt'));
    app = getApp(restApp);
    app.use(express.errorHandler());

    server = app.listen(9776);
  });

  afterAll(done => server.close(() => done()));

  commonTests(() => app, () => {
    return zeros()
      .configure(rest('http://localhost:9776').axios(axios))
      .configure(authClient());
  }, {
    email: 'expressauth@zerosjs.com',
    password: 'secret',
    provider: 'rest'
  });
});
