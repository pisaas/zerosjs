const bcrypt = require('bcryptjs');
const { get, omit } = require('lodash');
const { NotAuthenticated } = require('../../transport-commons/node_modules/@zerosjs/errors');
const { AuthenticationBaseStrategy } = require('@zerosjs/authentication');

const debug = require('debug')('@zerosjs/authentication-local/strategy');

exports.LocalStrategy = class LocalStrategy extends AuthenticationBaseStrategy {
  verifyConfiguration () {
    const config = this.configuration;

    [ 'usernameField', 'passwordField' ].forEach(prop => {
      if (typeof config[prop] !== 'string') {
        throw new Error(`'${this.name}' authentication strategy requires a '${prop}' setting`);
      }
    });
  }

  get configuration () {
    const authConfig = this.authentication.configuration;
    const config = super.configuration || {};

    return {
      hashSize: 10,
      service: authConfig.service,
      entity: authConfig.entity,
      entityId: authConfig.entityId,
      errorMessage: 'Invalid login',
      entityPasswordField: config.passwordField,
      entityUsernameField: config.usernameField,
      ...config
    };
  }

  async getEntityQuery (query, _params) {
    return {
      $limit: 1,
      ...query
    };
  }

  async findEntity (username, params) {
    const { entityUsernameField, service, errorMessage } = this.configuration;
    if (!username) { // don't query for users without any condition set.
      throw new NotAuthenticated(errorMessage);
    }

    const query = await this.getEntityQuery({
      [entityUsernameField]: username
    }, params);

    const findParams = Object.assign({}, params, { query });
    const entityService = this.app.service(service);

    debug('Finding entity with query', params.query);

    const result = await entityService.find(findParams);
    const list = Array.isArray(result) ? result : result.data;

    if (!Array.isArray(list) || list.length === 0) {
      debug(`No entity found`);

      throw new NotAuthenticated(errorMessage);
    }

    const [ entity ] = list;

    return entity;
  }

  async getEntity (result, params) {
    const { entityService } = this;
    const { entityId = entityService.id, entity } = this.configuration;

    if (!entityId || result[entityId] === undefined) {
      throw new NotAuthenticated('Could not get local entity');
    }

    if (!params.provider) {
      return result;
    }

    return entityService.get(result[entityId], {
      ...params,
      [entity]: result
    });
  }

  async comparePassword (entity, password) {
    const { entityPasswordField, errorMessage } = this.configuration;
    // find password in entity, this allows for dot notation
    const hash = get(entity, entityPasswordField);

    if (!hash) {
      debug(`Record is missing the '${entityPasswordField}' password field`);

      throw new NotAuthenticated(errorMessage);
    }

    debug('Verifying password');

    const result = await bcrypt.compare(password, hash);

    if (result) {
      return entity;
    }

    throw new NotAuthenticated(errorMessage);
  }

  async hashPassword (password, _params) {
    return bcrypt.hash(password, this.configuration.hashSize);
  }

  async authenticate (data, params) {
    const { passwordField, usernameField, entity } = this.configuration;
    const username = data[usernameField];
    const password = data[passwordField];
    const result = await this.findEntity(username, omit(params, 'provider'));

    await this.comparePassword(result, password);

    return {
      authentication: { strategy: this.name },
      [entity]: await this.getEntity(result, params)
    };
  }
}
