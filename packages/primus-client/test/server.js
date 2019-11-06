const zeros = require('@zerosjs/zeros');
const primus = require('@zerosjs/primus');
const { Service } = require('@zerosjs/adapter-memory');

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

class TodoService extends Service {
  constructor (options, app) {
    options = Object.assign({ public: true }, options);
    super(options, app);
  }

  get (id, params) {
    if (params.query.error) {
      return Promise.reject(new Error('Something went wrong'));
    }

    return super.get(id)
      .then(data => Object.assign({ query: params.query }, data));
  }
}

module.exports = function (cb) {
  const app = zeros()
    .configure(primus({
      transformer: 'websockets'
    }, cb))
    .use('/todos', new TodoService());

  app.service('todos').create({
    text: 'some todo',
    complete: false
  });

  return app;
};
