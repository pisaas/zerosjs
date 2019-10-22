const { AuthenticationService: FAuthenticationService } = require('@feathersjs/authentication');
// const { expressOauth, OAuthStrategy } = require('@feathersjs/authentication-oauth');
const { LocalStrategy } = require('./strategies/local');
const { JWTStrategy } = require('./strategies/jwt');

module.exports = app => {
  const authentication = new AuthenticationService(app);
  
  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  // app.configure(expressOauth());
};

class AuthenticationService extends FAuthenticationService {
  constructor (app, configKey, options = {}) {
    super(app, configKey, options);

    this.options = Object.assign({
      public: true
    }, this.options);
  }
}