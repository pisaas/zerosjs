const { omit } = require('lodash');
const { NotAuthenticated } = require('../../transport-commons/node_modules/@zerosjs/errors');
const lt = require('long-timeout');

const { AuthenticationBaseStrategy } = require('./strategy');

const debug = require('debug')('@zerosjs/authentication/jwt');
const SPLIT_HEADER = /(\S+)\s+(\S+)/;

exports.JWTStrategy = class JWTStrategy extends AuthenticationBaseStrategy {
  constructor () {
    super();
    
    this.expirationTimers = new WeakMap();
  }

  get configuration () {
    const authConfig = this.authentication.configuration;
    const config = super.configuration;

    return {
      entity: authConfig.entity,
      service: authConfig.service,
      header: 'Authorization',
      schemes: [ 'Bearer', 'JWT' ],
      ...config
    };
  }

  async handleConnection (event, connection, authResult) {
    const isValidLogout = event === 'logout' && connection.authentication && authResult &&
      connection.authentication.accessToken === authResult.accessToken;

    const { accessToken } = authResult || {};

    if (accessToken && event === 'login') {
      debug('Adding authentication information to connection');
      const { exp } = await this.authentication.verifyAccessToken(accessToken);
      // The time (in ms) until the token expires
      const duration = (exp * 1000) - new Date().getTime();
      // This may have to be a `logout` event but right now we don't want
      // the whole context object lingering around until the timer is gone
      const timer = lt.setTimeout(() => this.app.emit('disconnect', connection), duration);

      debug(`Registering connection expiration timer for ${duration}ms`);
      this.expirationTimers.set(connection, timer);

      debug('Adding authentication information to connection');
      connection.authentication = {
        strategy: this.name,
        accessToken
      };
    } else if (event === 'disconnect' || isValidLogout) {
      debug('Removing authentication information and expiration timer from connection');

      delete connection.authentication;
      lt.clearTimeout(this.expirationTimers.get(connection));
    }
  }

  verifyConfiguration () {
    const allowedKeys = [ 'entity', 'service', 'header', 'schemes' ];

    for (const key of Object.keys(this.configuration)) {
      if (!allowedKeys.includes(key)) {
        throw new Error(`Invalid JwtStrategy option 'authentication.${this.name}.${key}'. Did you mean to set it in 'authentication.jwtOptions'?`);
      }
    }
  }

  /**
   * Return the entity for a given id
   * @param id The id to use
   * @param params Service call parameters
   */
  async getEntity (id, params) {
    const { entity } = this.configuration;
    const entityService = this.entityService;

    debug('Getting entity', id);

    if (entityService === null) {
      throw new NotAuthenticated(`Could not find entity service`);
    }

    const result = await entityService.get(id, omit(params, 'provider'));

    if (!params.provider) {
      return result;
    }

    return entityService.get(id, { ...params, [entity]: result });
  }

  async getEntityId (authResult, _params) {
    return authResult.authentication.payload.sub;
  }

  async authenticate (authentication, params) {
    const { accessToken } = authentication;
    const { entity } = this.configuration;

    if (!accessToken) {
      throw new NotAuthenticated('No access token');
    }

    const payload = await this.authentication.verifyAccessToken(accessToken, params.jwt);
    const result = {
      accessToken,
      authentication: {
        strategy: 'jwt',
        payload
      }
    };
    const entityId = await this.getEntityId(result, params);

    if (entity === null) {
      return result;
    }

    const value = await this.getEntity(entityId, params);

    return {
      ...result,
      [entity]: value
    };
  }

  async parse (req) {
    const result = { strategy: this.name };
    const { header, schemes } = this.configuration;
    const headerValue = req.headers && req.headers[header.toLowerCase()];

    if (!headerValue || typeof headerValue !== 'string') {
      return null;
    }

    debug('Found parsed header value');

    const [ , scheme = null, schemeValue = null ] = headerValue.match(SPLIT_HEADER) || [];
    const hasScheme = scheme && schemes.some(
      current => new RegExp(current, 'i').test(scheme)
    );

    if (scheme && !hasScheme) {
      return null;
    }

    return {
      ...result,
      accessToken: hasScheme ? schemeValue : headerValue
    };
  }
}
