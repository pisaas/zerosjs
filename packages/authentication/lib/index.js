const hooks = require('./hooks');

const { authenticate } = hooks;

const {
  AuthenticationBase,
  AuthenticationRequest,
  AuthenticationResult,
  AuthenticationStrategy
} = require('./core');

const { AuthenticationBaseStrategy } = require('./strategy');
const { AuthenticationService } = require('./service');
const { JWTStrategy } = require('./jwt');

module.exports = {
  hooks,
  authenticate,
  AuthenticationBase,
  AuthenticationRequest,
  AuthenticationResult,
  AuthenticationStrategy,
  AuthenticationBaseStrategy,
  AuthenticationService,
  JWTStrategy
}
