const assert = require('assert');

/**
 * 
 * @param {any} app 
 * @param {string} name 
 */
exports.setupTests = function (app, name) {
  const getService = () => (name && typeof app.service === 'function')
    ? app.service(name) : app;

  describe('Service base tests', () => {
    it('.find', () => {
      /**
       * todos: []
       * {
       *   text: string;
       *   complete?: boolean;
       *   id?: number;
       * }
       */
      return getService().find().then((todos) =>
        assert.deepEqual(todos, [{ // eslint-disable-line
          text: 'some todo',
          complete: false,
          id: 0
        }])
      );
    });

    it('.get and params passing', () => {
      const query = {
        some: 'thing',
        other: ['one', 'two'],
        nested: { a: { b: 'object' } }
      };

      return getService().get(0, { query })
        .then((todo) => assert.deepEqual(todo, { // eslint-disable-line
          id: 0,
          text: 'some todo',
          complete: false,
          query
        }));
    });

    it('.create and created event', done => {
      getService().once('created', (data) => {
        assert.strictEqual(data.text, 'created todo');
        assert.ok(data.complete);
        done();
      });

      getService().create({ text: 'created todo', complete: true });
    });

    it('.update and updated event', done => {
      getService().once('updated', (data) => {
        assert.strictEqual(data.text, 'updated todo');
        assert.ok(data.complete);
        done();
      });

      getService().create({ text: 'todo to update', complete: false })
        .then((todo) => getService().update(todo.id, {
          text: 'updated todo',
          complete: true
        }));
    });

    it('.patch and patched event', done => {
      getService().once('patched', (data) => {
        assert.strictEqual(data.text, 'todo to patch');
        assert.ok(data.complete);
        done();
      });

      getService().create({ text: 'todo to patch', complete: false })
        .then((todo) => getService().patch(todo.id, { complete: true }));
    });

    it('.remove and removed event', done => {
      getService().once('removed', (data) => {
        assert.strictEqual(data.text, 'todo to remove');
        assert.strictEqual(data.complete, false);
        done();
      });

      getService().create({ text: 'todo to remove', complete: false })
        .then((todo) => getService().remove(todo.id)).catch(done);
    });

    it('.get with error', () => {
      const query = { error: true };

      return getService().get(0, { query }).catch((error) =>
        assert.ok(error && error.message)
      );
    });
  });
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(exports.setupTests, module.exports);
}
