const { authenticate } = require('@zerosjs/authentication');
const memory = require('@zerosjs/adapter-memory');
const { AuthenticationService, JWTStrategy } = require('@zerosjs/authentication');
const { LocalStrategy, hooks } = require('@zerosjs/authentication-local');

const { hashPassword, protect } = hooks;

module.exports = (app) => {
  const authentication = new AuthenticationService(app);

  app.set('authentication', {
    entity: 'user',
    service: 'users',
    secret: 'supersecret',
    authStrategies: [ 'local', 'jwt' ],
    local: {
      usernameField: 'email',
      passwordField: 'password'
    }
  });

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  app.use('/users', memory({
    public: true,
    paginate: {
      default: 10,
      max: 20
    }
  }));

  app.service('users').hooks({
    before: {
      create: hashPassword('password')
    },
    after: protect('password')
  });

  app.use('/dummy', {
    options: { public: true },
    find (params) {
      return Promise.resolve(params);
    }
  });

  app.service('dummy').hooks({
    before: authenticate('jwt')
  });

  app.service('users').hooks({
    before (context) {
      if (context.id !== undefined && context.id !== null) {
        context.id = parseInt(context.id, 10);
      }

      return context;
    }
  });

  return app;
};
