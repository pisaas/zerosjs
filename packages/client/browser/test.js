const assert = require('assert');
const baseTests = require('@zerosjs/tests/lib/client');
const memory = require('@zerosjs/adapter-memory');

const zeros = require('../dist/zeros');

// Create an in-memory CRUD service for our Todos
class TodoService extends memory.Service {
  constructor (options, app) {
    options = Object.assign({ public: true }, options);
    super(options, app);
  }

  get (id, params) {
    if (params.query.error) {
      return Promise.reject(new Error('Something went wrong'));
    }

    return super.get(id).then(data =>
      Object.assign({ query: params.query }, data)
    );
  }
}

describe('Feathers client browser smoke tests', function () {
  const app = zeros()
    .use('/myservice', {
      get (id) {
        return Promise.resolve({
          id, description: `You have to do ${id}!`
        });
      },

      create (data) {
        return Promise.resolve(data);
      }
    })
    .use('/todos', new TodoService({
      multi: true
    }));

  app.service('myservice').hooks({
    before: {
      create (hook) {
        hook.data.hook = true;
      }
    },
    after: {
      get (hook) {
        hook.result.ran = true;
      }
    }
  });

  beforeAll(() => app.service('todos').create({
    text: 'some todo',
    complete: false
  }));

  afterAll(() => app.service('todos').remove(null));

  baseTests(app, 'todos');

  describe('Client side hooks and services', () => {
    it('initialized myservice and works with hooks', done => {
      app.service('myservice').get('dishes').then(todo => {
        assert.deepEqual(todo, {
          id: 'dishes',
          description: 'You have to do dishes!',
          ran: true
        });
        done();
      }).catch(done);
    });

    it('create and event with hook', done => {
      const myservice = app.service('myservice');

      myservice.once('created', data => {
        assert.deepEqual(data, {
          description: 'Test todo',
          hook: true
        });
        done();
      });

      myservice.create({ description: 'Test todo' });
    });

    describe('Feathers Errors', () => {
      describe('successful error creation', () => {
        describe('without custom message', () => {
          it('default error', () => {
            const error = new zeros.errors.GeneralError();
            assert.equal(error.code, 500);
            assert.equal(error.message, 'Error');
            assert.equal(error.className, 'general-error');
            assert.equal(error instanceof zeros.errors.GeneralError, true);
            assert.equal(error instanceof zeros.errors.ZerosError, true);
          });
        });
      });
    });
  });
});
