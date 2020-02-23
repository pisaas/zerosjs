const assert = require('assert');
const axios = require('axios');
const zeros = require('@zerosjs/zeros');
const baseTests = require('@zerosjs/tests/lib/client');
const errors = require('@zerosjs/errors');
const server = require('./server');
const rest = require('../lib/index');

describe('Axios REST connector', function () {
  const url = 'http://localhost:8889';
  const setup = rest(url).axios(axios);
  const app = zeros().configure(setup);
  const service = app.service('todos');

  beforeAll(function (done) {
    this.server = server().listen(8889, done);
  });

  afterAll(function (done) {
    this.server.close(done);
  });

  baseTests(service);

  it('supports custom headers', () => {
    let headers = {
      'Authorization': 'let-me-in'
    };

    return service.get(0, { headers }).then(todo =>
      assert.deepStrictEqual(todo, {
        id: 0,
        authorization: 'let-me-in',
        text: 'some todo',
        complete: false,
        query: {}
      })
    );
  });

  it('uses params.connection for additional options', () => {
    const connection = {
      headers: {
        'Authorization': 'let-me-in'
      }
    };

    return service.get(0, { connection }).then(todo =>
      assert.deepStrictEqual(todo, {
        id: 0,
        authorization: 'let-me-in',
        text: 'some todo',
        complete: false,
        query: {}
      })
    );
  });

  it('can initialize a client instance', () => {
    const init = rest(url).axios(axios);
    const todos = init.service('todos');

    assert.ok(todos instanceof init.Service, 'Returned service is a client');

    return todos.find({}).then(todos =>
      assert.deepStrictEqual([todos[0]], [
        {
          text: 'some todo',
          complete: false,
          id: 0
        }
      ])
    );
  });

  it('supports nested arrays in queries', () => {
    const query = { test: { $in: [ '0', '1', '2' ] } };

    return service.get(0, { query }).then(data =>
      assert.deepStrictEqual(data.query, query)
    );
  });

  it('remove many', () => {
    return service.remove(null).then(todo => {
      assert.strictEqual(todo.id, null);
      assert.strictEqual(todo.text, 'deleted many');
    });
  });

  it('converts zeros errors (#50)', () => {
    return service.get(0, { query: { zerosError: true } })
      .catch(error => {
        assert.ok(error instanceof errors.NotAcceptable);
        assert.strictEqual(error.message, 'This is a Zeros error');
        assert.strictEqual(error.code, 406);
      });
  });

  it('ECONNREFUSED errors are serializable', () => {
    const url = 'http://localhost:60000';
    const setup = rest(url).axios(axios);
    const app = zeros().configure(setup);

    return app.service('something').find().catch(e => {
      const err = JSON.parse(JSON.stringify(e));

      assert.strictEqual(err.name, 'Unavailable');
      assert.strictEqual(err.message, 'connect ECONNREFUSED 127.0.0.1:60000');
      assert.ok(e.data.config);
    });
  });
});
