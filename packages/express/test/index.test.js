const assert = require('assert');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const zeros = require('@zerosjs/zeros');

const expressify = require('../lib');

describe('@zerosjs/express', () => {
  const service = {
    get (id) {
      return Promise.resolve({ id });
    }
  };

  it('exports .default, .original .rest, .notFound and .errorHandler', () => {
    assert.strictEqual(expressify.default, expressify);
    assert.strictEqual(expressify.original, express);
    assert.strictEqual(typeof expressify.rest, 'function');
    assert.ok(expressify.notFound);
    assert.ok(expressify.errorHandler);
  });

  it('returns an Express application', () => {
    const app = expressify(zeros());

    assert.strictEqual(typeof app, 'function');
  });

  it('allows to use an existing Express instance', () => {
    const expressApp = express();
    const app = expressify(zeros(), expressApp);

    assert.strictEqual(app, expressApp);
  });

  it('exports `express.rest`', () => {
    assert.ok(typeof expressify.rest === 'function');
  });

  it('returns a plain express app when no app is provided', () => {
    const app = expressify();

    assert.strictEqual(typeof app.use, 'function');
    assert.strictEqual(typeof app.service, 'undefined');
    assert.strictEqual(typeof app.services, 'undefined');
  });

  it('errors when app with wrong version is provided', () => {
    try {
      expressify({});
    } catch (e) {
      assert.strictEqual(e.message, '@zerosjs/express requires a valid Zeros application instance');
    }

    try {
      const app = zeros();
      app.version = '0.0.0';

      expressify(app);
    } catch (e) {
      assert.strictEqual(e.message, '@zerosjs/express requires an instance of a Zeros application version 0.x or later (got 0.0.0)');
    }

    try {
      const app = zeros();
      delete app.version;

      expressify(app);
    } catch (e) {
      assert.strictEqual(e.message, '@zerosjs/express requires an instance of a Zeros application version 0.x or later (got unknown)');
    }
  });

  it('Can use Express sub-apps', () => {
    const app = expressify(zeros());
    const child = express();

    app.use('/path', child);
    assert.strictEqual(child.parent, app);
  });

  it('Can use express.static', () => {
    const app = expressify(zeros());

    app.use('/path', expressify.static(__dirname));
  });

  it('has Zeros functionality', () => {
    const app = expressify(zeros());

    app.use('/myservice', service);

    app.hooks({
      after: {
        get (hook) {
          hook.result.fromAppHook = true;
        }
      }
    });

    app.service('myservice').hooks({
      after: {
        get (hook) {
          hook.result.fromHook = true;
        }
      }
    });

    return app.service('myservice').get(10)
      .then(data => assert.deepStrictEqual(data, {
        id: 10,
        fromHook: true,
        fromAppHook: true
      }));
  });

  it('can register a service and start an Express server', done => {
    const app = expressify(zeros());
    const response = {
      message: 'Hello world'
    };

    app.use('/myservice', service);
    app.use((req, res) => res.json(response));

    const server = app.listen(8787).on('listening', () => {
      app.service('myservice').get(10)
        .then(data => assert.deepStrictEqual(data, { id: 10 }))
        .then(() => axios.get('http://localhost:8787'))
        .then(res => assert.deepStrictEqual(res.data, response))
        .then(() => server.close(() => done()))
        .catch(done);
    });
  });

  it('.listen calls .setup', done => {
    const app = expressify(zeros());
    let called = false;

    app.use('/myservice', {
      get (id) {
        return Promise.resolve({ id });
      },

      setup (appParam, path) {
        try {
          assert.strictEqual(appParam, app);
          assert.strictEqual(path, 'myservice');
          called = true;
        } catch (e) {
          done(e);
        }
      }
    });

    const server = app.listen(8787).on('listening', () => {
      try {
        assert.ok(called);
        server.close(() => done());
      } catch (e) {
        done(e);
      }
    });
  });

  it('passes middleware as options', () => {
    const zerosApp = zeros();
    const app = expressify(zerosApp);
    const oldUse = zerosApp.use;
    const a = (req, res, next) => next();
    const b = (req, res, next) => next();
    const c = (req, res, next) => next();
    const service = {
      get (id) {
        return Promise.resolve({ id });
      }
    };

    zerosApp.use = function (path, serviceArg, options) {
      assert.strictEqual(path, '/myservice');
      assert.strictEqual(serviceArg, service);
      assert.deepStrictEqual(options.middleware, {
        before: [a, b],
        after: [c]
      });
      return oldUse.apply(this, arguments);
    };

    app.use('/myservice', a, b, service, c);
  });

  it('throws an error for invalid middleware options', () => {
    const zerosApp = zeros();
    const app = expressify(zerosApp);
    const service = {
      get (id) {
        return Promise.resolve({ id });
      }
    };

    try {
      app.use('/myservice', service, 'hi');
    } catch (e) {
      assert.strictEqual(e.message, 'Invalid options passed to app.use');
    }
  });

  // it('Works with HTTPS', done => {
  //   const todoService = {
  //     get (name) {
  //       return Promise.resolve({
  //         id: name,
  //         description: `You have to do ${name}!`
  //       });
  //     }
  //   };

  //   const app = expressify(zeros())
  //     .configure(expressify.rest())
  //     .use('/secureTodos', todoService);

  //   const httpsServer = https.createServer({
  //     key: fs.readFileSync(path.join(__dirname, '..', '..', 'tests', 'resources', 'privatekey.pem')),
  //     cert: fs.readFileSync(path.join(__dirname, '..', '..', 'tests', 'resources', 'certificate.pem')),
  //     rejectUnauthorized: false,
  //     requestCert: false
  //   }, app).listen(7889);

  //   app.setup(httpsServer);

  //   httpsServer.on('listening', function () {
  //     const instance = axios.create({
  //       httpsAgent: new https.Agent({
  //         rejectUnauthorized: false
  //       })
  //     });

  //     instance.get('https://localhost:7889/secureTodos/dishes').then(response => {
  //       assert.ok(response.status === 200, 'Got OK status code');
  //       assert.strictEqual(response.data.description, 'You have to do dishes!');
  //       httpsServer.close(() => done());
  //     }).catch(done);
  //   });
  // });
});
