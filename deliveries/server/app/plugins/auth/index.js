const { AuthenticationService: ZAuthenticationService } = require('@zerosjs/authentication');
const { LocalStrategy } = require('./strategies/local');
const { JWTStrategy } = require('./strategies/jwt');

module.exports = function definePlugin(zeros) {
  return {
    hooks: require('./hooks'),

    initialize (next) {
      zeros.after(['plugin:services:loaded'], () => {
        const authentication = new AuthenticationService(zeros);
  
        authentication.register('jwt', new JWTStrategy());
        authentication.register('local', new LocalStrategy());
  
        zeros.use('/authentication', authentication);
  
        return next();
      });
    }
  };
};

class AuthenticationService extends ZAuthenticationService {
  constructor (app, configKey, options = {}) {
    super(app, configKey, options);

    this.options = Object.assign({
      public: true
    }, this.options);
  }
}