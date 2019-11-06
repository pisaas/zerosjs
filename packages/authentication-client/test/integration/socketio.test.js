const io = require('socket.io-client');
const assert = require('assert');
const zeros = require('@zerosjs/zeros');
const socketio = require('@zerosjs/socketio');
const socketioClient = require('@zerosjs/socketio-client');

const authClient = require('../../lib');
const getApp = require('./fixture');
const commonTests = require('./commons');

describe('@zerosjs/authentication-client Socket.io integration', () => {
  let app;

  beforeAll(() => {
    app = getApp(zeros().configure(socketio()));

    app.listen(9777);
  });

  afterAll(done => app.io.close(() => done()));

  it('allows to authenticate with handshake headers and sends login event', async () => {
    const user = { email: 'authtest@example.com', password: 'alsosecret' };

    await app.service('users').create(user);

    const { accessToken } = await app.service('authentication').create({
      strategy: 'local',
      ...user
    });

    const socket = io('http://localhost:9777', {
      transports: [ 'websocket' ],
      transportOptions: {
        websocket: {
          extraHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    });
    const authResult = await new Promise(resolve =>
      app.once('login', res => resolve(res))
    );

    assert.strictEqual(authResult.accessToken, accessToken);

    const dummy = await new Promise((resolve, reject) => {
      socket.emit('find', 'dummy', {}, (error, page) =>
        error ? reject(error) : resolve(page)
      );
    });

    assert.strictEqual(dummy.user.email, user.email);
    assert.strictEqual(dummy.authentication.accessToken, accessToken);
    assert.strictEqual(dummy.headers.authorization, `Bearer ${accessToken}`);
  });

  commonTests(() => app, () => {
    return zeros()
      .configure(socketioClient(io('http://localhost:9777')))
      .configure(authClient());
  }, {
    email: 'socketioauth@zerosjs.com',
    password: 'secretive',
    provider: 'socketio'
  });
});
