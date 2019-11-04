const { get, set, cloneDeep } = require('lodash');
const { BadRequest } = require('../../../transport-commons/node_modules/@zerosjs/errors');

const debug = require('debug')('@zerosjs/authentication-local/hooks/hash-password');

module.exports = function hashPassword (field, options = {}) {
  if (!field) {
    throw new Error('The hashPassword hook requires a field name option');
  }

  return async (context) => {
    if (context.type !== 'before') {
      throw new Error(`The 'hashPassword' hook should only be used as a 'before' hook`);
    }

    const { app, data, params } = context;
    const password = get(data, field);

    if (data === undefined || password === undefined) {
      debug(`hook.data or hook.data.${field} is undefined. Skipping hashPassword hook.`);
      return context;
    }

    const authService = app.defaultAuthentication(options.authentication);
    const { strategy = 'local' } = options;

    if (!authService || typeof authService.getStrategies !== 'function') {
      throw new BadRequest(`Could not find an authentication service to hash password`);
    }

    const [ localStrategy ] = authService.getStrategies(strategy);

    if (!localStrategy || typeof localStrategy.hashPassword !== 'function') {
      throw new BadRequest(`Could not find '${strategy}' strategy to hash password`);
    }

    const hashedPassword = await localStrategy.hashPassword(password, params);

    context.data = set(cloneDeep(data), field, hashedPassword);

    return context;
  };
}
