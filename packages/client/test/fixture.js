const zeros = require('@zerosjs/zeros');
const express = require('@zerosjs/express');
const rest = require('@zerosjs/express/rest');
const memory = require('@zerosjs/adapter-memory');

// eslint-disable-next-line no-extend-native
Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    var alt = {};

    Object.getOwnPropertyNames(this).forEach(function (key) {
      alt[key] = this[key];
    }, this);

    return alt;
  },
  configurable: true
});

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

module.exports = function (configurer) {
  const app = express(zeros())
    .configure(rest());

  if (typeof configurer === 'function') {
    configurer.call(app);
  }

  // Parse HTTP bodies
  app.use(express.json())
    .use(express.urlencoded({ extended: true }))
    // Host the current directory (for index.html)
    .use(express.static(process.cwd()))
    // Host our Todos service on the /todos path
    .use('/todos', new TodoService({
      multi: true
    }));

  const testTodo = {
    text: 'some todo',
    complete: false
  };
  const service = app.service('todos');

  service.create(testTodo);
  service.hooks({
    after: {
      remove (hook) {
        if (hook.id === null) {
          service._uId = 0;
          return service.create(testTodo)
            .then(() => hook);
        }
      }
    }
  });

  app.on('connection', connection =>
    app.channel('general').join(connection)
  );

  if (service.publish) {
    service.publish(() => app.channel('general'));
  }

  return app;
};
