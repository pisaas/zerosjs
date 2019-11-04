const zeros = require('@zerosjs/zeros');
const memory = require('@zerosjs/adapter-memory');
const { AuthenticationService, JWTStrategy } = require('@zerosjs/authentication');

const { LocalStrategy, hooks } = require('@zerosjs/authentication-local');
const { hashPassword, protect } = hooks;

module.exports = (app = zeros()) => {
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
    paginate: {
      default: 10,
      max: 20
    }
  }));

  app.service('users').hooks({
    before: {
      create: hashPassword('password')
    },
    after: {
      all: protect('password'),
      get: [context => {
        if (context.params.provider) {
          context.result.fromGet = true;
        }

        return context;
      }]
    }
  });

  return app;
};
