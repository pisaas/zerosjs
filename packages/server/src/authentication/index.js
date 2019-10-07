const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
// const { expressOauth, OAuthStrategy } = require('@feathersjs/authentication-oauth');
const { LocalStrategy } = require('./strategies/local');

module.exports = app => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  // app.configure(expressOauth());
};
