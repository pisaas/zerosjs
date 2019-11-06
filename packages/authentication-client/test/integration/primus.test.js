const Primus = require('primus');
const Emitter = require('primus-emitter');
const zeros = require('@zerosjs/zeros');
const primusClient = require('@zerosjs/primus-client');
const primus = require('@zerosjs/primus');

const authClient = require('../../lib');
const getApp = require('./fixture');
const commonTests = require('./commons');

const port = 8998;
const baseURL = `http://localhost:${port}`;
const Socket = Primus.createSocket({
  transformer: 'websockets',
  plugin: {
    emitter: Emitter
  }
});

describe('@zerosjs/authentication-client Primus integration', () => {
  let app;
  let server;

  beforeAll(() => {
    app = getApp(zeros().configure(primus({
      transformer: 'websockets'
    })));

    server = app.listen(port);
  });

  afterAll(() => server.close());

  commonTests(() => app, () => {
    return zeros()
      .configure(primusClient(new Socket(baseURL), { timeout: 1000 }))
      .configure(authClient());
  }, {
    email: 'primusauth@zerosjs.com',
    password: 'secrets',
    provider: 'primus'
  });
});
