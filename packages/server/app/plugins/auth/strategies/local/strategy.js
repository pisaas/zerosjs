const { get, omit, isArray } = require('lodash');
const Debug = require('debug');
const { NotAuthenticated } = require('@zerosjs/errors');
const { AuthenticationBaseStrategy } = require('@zerosjs/authentication');

const debug = Debug('@zerosjs/server/authentication/strategies/local');

class LocalStrategy extends AuthenticationBaseStrategy {
  verifyConfiguration () {
    const config = this.configuration;

    [ 'usernameField', 'passwordField', 'verifyFields' ].forEach(prop => {
      if (
        (prop !== 'verifyFields' && typeof config[prop] !== 'string')
        || (prop === 'verifyFields' && !isArray(config[prop]))
      ) {
        throw new Error(`'${this.name}' authentication strategy requires a '${prop}' setting`);
      }
    });
  }

  get configuration () {
    const authConfig = this.authentication.configuration;
    const config = super.configuration || {};

    return {
      service: authConfig.service,
      entity: authConfig.entity,
      entityId: authConfig.entityId,
      errorMessage: 'Invalid login',
      entityPasswordField: config.passwordField,
      entityUsernameField: config.usernameField,
      entityVerifyFields: config.verifyFields,
      ...config
    };
  }

  async getEntityQuery (query) {
    return {
      $limit: 1,
      ...query
    };
  }

  async findEntity (username, params) {
    const { verifyFields, service, errorMessage } = this.configuration;

    if (!username) { // don't query for users without any condition set.
      throw new NotAuthenticated(errorMessage);
    }

    const query = await this.getEntityQuery({
      $or: verifyFields.map((fieldName) => {
        return { [fieldName]: username };
      })
    }, params);

    const findParams = Object.assign({}, params, { query });
    const entityService = this.app.service(service);

    debug('Finding entity with query', params.query);

    const result = await entityService.find(findParams);
    const list = Array.isArray(result) ? result : result.data;

    if (!Array.isArray(list) || list.length === 0) {
      debug('No entity found');

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
      inner: true,
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

    const pwdService = this.app.service('core/security/password');
    const result = await pwdService.compare(password, hash);

    if (result) {
      return entity;
    }

    throw new NotAuthenticated(errorMessage);
  }

  async hashPassword (password) {
    const pwdService = this.app.service('core/security/password');
    return pwdService.hash(password);
  }

  /**
   * 执行认证
   * @param {AuthenticationRequest} data 
   * @param {*} params 
   */
  async authenticate (data, params) {
    const { passwordField, usernameField, entity, errorMessage } = this.configuration;
    const username = data[usernameField];
    const password = data[passwordField];

    // 默认认证目标，client（默认）, admin, console
    // const authTarget = data['target'] || 'client';

    // 生产环境不能登入0用户
    if (username == '0' && process.env.NODE_ENV === 'production') {
      throw new NotAuthenticated(errorMessage);
    }

    const result = await this.findEntity(username, omit(params, 'provider'));

    await this.comparePassword(result, password);

    return {
      authentication: { strategy: this.name },
      [entity]: await this.getEntity(result, params)
    };
  }
}

module.exports = {
  LocalStrategy
};
