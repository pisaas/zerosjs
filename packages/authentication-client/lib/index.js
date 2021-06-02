const { AuthenticationClient, AuthenticationClientOptions } = require('./core');
const hooks = require('./hooks');
const { Storage, MemoryStorage, StorageWrapper } = require('./storage');

const getDefaultStorage = () => {
  try {
    return new StorageWrapper(window.localStorage);
  } catch (error) {}

  return new MemoryStorage();
};

const defaultStorage = getDefaultStorage();

const defaults = {
  header: 'Authorization',
  scheme: 'Bearer',
  storageKey: 'zeros-jwt',
  locationKey: 'access_token',
  locationErrorKey: 'error',
  jwtStrategy: 'jwt',
  path: '/authentication',
  Authentication: AuthenticationClient,
  storage: defaultStorage
};

const init = (_options = {}) => {
  const options = Object.assign({}, defaults, _options);
  const { Authentication } = options;

  return (app) => {
    const authentication = new Authentication(app, options);

    app.authentication = authentication;
    app.authenticate = authentication.authenticate.bind(authentication);
    app.reAuthenticate = authentication.reAuthenticate.bind(authentication);
    app.logout = authentication.logout.bind(authentication);

    app.hooks({
      before: {
        all: [
          hooks.authentication(),
          hooks.populateHeader()
        ]
      }
    });
  };
};

module.exports = Object.assign(init, {
  getDefaultStorage,
  AuthenticationClient,
  AuthenticationClientOptions,
  Storage,
  MemoryStorage,
  hooks,
  defaultStorage,
  defaults
});
