const assert = require('assert');
const zero = require('@zerojs/zero');

const hook = require('../../lib/hooks/event');

describe('authentication/hooks/events', () => {
  const app = zero().use('/authentication', {
    async create (data) {
      return data;
    },

    async remove (id) {
      return { id };
    }
  });

  const service = app.service('authentication');

  service.hooks({
    after: {
      create: [ hook('login') ],
      remove: [ hook('logout') ]
    }
  });

  it('login', done => {
    const data = {
      message: 'test'
    };

    app.once('login', (result, params, context) => {
      try {
        assert.deepStrictEqual(result, data);
        assert.ok(params.testParam);
        assert.ok(context.method, 'create');
        done();
      } catch (error) {
        done(error);
      }
    });

    service.create(data, {
      testParam: true,
      provider: 'test'
    });
  });

  it('logout', done => {
    app.once('logout', (result, params, context) => {
      try {
        assert.deepStrictEqual(result, {
          id: 'test'
        });
        assert.ok(params.testParam);
        assert.ok(context.method, 'remove');
        done();
      } catch (error) {
        done(error);
      }
    });

    service.remove('test', {
      testParam: true,
      provider: 'test'
    });
  });

  it('does nothing when provider is not set', done => {
    const handler = () => {
      done(new Error('Should never get here'));
    };

    app.on('logout', handler);
    service.once('removed', (result) => {
      app.removeListener('logout', handler);
      assert.deepStrictEqual(result, {
        id: 'test'
      });
      done();
    });

    service.remove('test');
  });
});
