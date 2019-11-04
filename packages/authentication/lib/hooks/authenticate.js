const { flatten, omit, merge } = require('lodash');
const { NotAuthenticated } = require('../../../transport-commons/node_modules/@zerosjs/errors');

const debug = require('debug')('@zerosjs/authentication/hooks/authenticate');

module.exports = (originalSettings, ...originalStrategies) => {
  const settings = typeof originalSettings === 'string'
    ? { strategies: flatten([ originalSettings, ...originalStrategies ]) }
    : originalSettings;

  if (!originalSettings || settings.strategies.length === 0) {
    throw new Error('The authenticate hook needs at least one allowed strategy');
  }

  return async (context) => {
    const { app, params, type, path, service } = context;
    const { strategies } = settings;
    const { provider, authentication } = params;
    const authService = app.defaultAuthentication(settings.service);

    debug(`Running authenticate hook on '${path}'`);

    if (type && type !== 'before') {
      throw new NotAuthenticated('The authenticate hook must be used as a before hook');
    }

    if (!authService || typeof authService.authenticate !== 'function') {
      throw new NotAuthenticated('Could not find a valid authentication service');
    }

    // @ts-ignore
    if (service === authService) {
      throw new NotAuthenticated('The authenticate hook does not need to be used on the authentication service');
    }

    if (params.authenticated === true) {
      return context;
    }

    if (authentication) {
      const authParams = omit(params, 'provider', 'authentication', 'query');

      debug('Authenticating with', authentication, strategies);

      const authResult = await authService.authenticate(authentication, authParams, ...strategies);

      context.params = merge({}, params, omit(authResult, 'accessToken'), { authenticated: true });

      return context;
    } else if (!authentication && provider) {
      throw new NotAuthenticated('Not authenticated');
    }

    return context;
  };
};
