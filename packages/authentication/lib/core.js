const { promisify } = require('util');
const { merge } = require('lodash');
const jsonwebtoken = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const { NotAuthenticated } = require('../../transport-commons/node_modules/@zerosjs/errors');
const defaultOptions = require('./options');

const debug = require('debug')('@zerosjs/authentication/base');
const verifyJWT = promisify(jsonwebtoken.verify);
const createJWT = promisify(jsonwebtoken.sign);

/**
 * A base class for managing authentication strategies and creating and verifying JWTs
 */
exports.AuthenticationBase = class AuthenticationBase {
  /**
   * Create a new authentication service.
   * @param app The Zero application instance
   * @param configKey The configuration key name in `app.get` (default: `authentication`)
   * @param options Optional initial options
   */
  constructor (app, configKey = 'authentication', options = {}) {
    if (!app || typeof app.use !== 'function') {
      throw new Error('An application instance has to be passed to the authentication service');
    }

    this.app = app;
    this.strategies = {};
    this.configKey = configKey;
    this.options = Object.assign({ public: true }, options);

    app.set('defaultAuthentication', app.get('defaultAuthentication') || configKey);
    app.set(configKey, merge({}, app.get(configKey), options));
  }

  /**
   * Return the current configuration from the application
   */
  get configuration () {
    // Always returns a copy of the authentication configuration
    return Object.assign({}, defaultOptions, this.app.get(this.configKey));
  }

  /**
   * A list of all registered strategy names
   */
  get strategyNames () {
    return Object.keys(this.strategies);
  }

  /**
   * Register a new authentication strategy under a given name.
   * @param name The name to register the strategy under
   * @param strategy The authentication strategy instance
   */
  register (name, strategy) {
    // Call the functions a strategy can implement
    if (typeof strategy.setName === 'function') {
      strategy.setName(name);
    }

    if (typeof strategy.setApplication === 'function') {
      strategy.setApplication(this.app);
    }

    if (typeof strategy.setAuthentication === 'function') {
      strategy.setAuthentication(this);
    }

    if (typeof strategy.verifyConfiguration === 'function') {
      strategy.verifyConfiguration();
    }

    // Register strategy as name
    this.strategies[name] = strategy;
  }

  /**
   * Get the registered authentication strategies for a list of names.
   * The return value may contain `undefined` if the strategy does not exist.
   * @param names The list or strategy names
   */
  getStrategies (...names) {
    // Returns all strategies for a list of names (including undefined)
    return names.map(name => this.strategies[name])
      .filter(current => !!current);
  }

  /**
   * Create a new access token with payload and options.
   * @param payload The JWT payload
   * @param optsOverride The options to extend the defaults (`configuration.jwtOptions`) with
   * @param secretOverride Use a different secret instead
   */
  async createAccessToken (payload, optsOverride, secretOverride) {
    const { secret, jwtOptions } = this.configuration;
    // Use configuration by default but allow overriding the secret
    const jwtSecret = secretOverride || secret;
    // Default jwt options merged with additional options
    const options = merge({}, jwtOptions, optsOverride);

    if (!options.jwtid) {
      // Generate a UUID as JWT ID by default
      options.jwtid = uuidv4();
    }

    // @ts-ignore
    return createJWT(payload, jwtSecret, options);
  }

  /**
   * Verifies an access token.
   * @param accessToken The token to verify
   * @param optsOverride The options to extend the defaults (`configuration.jwtOptions`) with
   * @param secretOverride Use a different secret instead
   */
  async verifyAccessToken (accessToken, optsOverride, secretOverride) {
    const { secret, jwtOptions } = this.configuration;
    const jwtSecret = secretOverride || secret;
    const options = merge({}, jwtOptions, optsOverride);
    const { algorithm } = options;

    // Normalize the `algorithm` setting into the algorithms array
    if (algorithm && !options.algorithms) {
      options.algorithms = Array.isArray(algorithm) ? algorithm : [ algorithm ];
      delete options.algorithm;
    }

    try {
      // @ts-ignore
      const isValid = await verifyJWT(accessToken, jwtSecret, options);

      return isValid;
    } catch (error) {
      throw new NotAuthenticated(error.message, error);
    }
  }

  /**
   * Authenticate a given authentication request against a list of strategies.
   * @param authentication The authentication request
   * @param params Service call parameters
   * @param allowed A list of allowed strategy names
   */
  async authenticate (authentication, params, ...allowed) {
    const { strategy } = authentication || {};
    const [ authStrategy ] = this.getStrategies(strategy);

    debug('Running authenticate for strategy', strategy, allowed);

    if (!authentication || !authStrategy || !allowed.includes(strategy)) {
      // If there are no valid strategies or `authentication` is not an object
      throw new NotAuthenticated(`Invalid authentication information` + (!strategy ? ' (no `strategy` set)' : ''));
    }

    return authStrategy.authenticate(authentication, {
      ...params,
      authenticated: true
    });
  }

  async handleConnection (event, connection, authResult) {
    const strategies = this.getStrategies(...Object.keys(this.strategies))
      .filter(current => typeof current.handleConnection === 'function');

    for (const strategy of strategies) {
      await strategy.handleConnection(event, connection, authResult);
    }
  }

  /**
   * Parse an HTTP request and response for authentication request information.
   * @param req The HTTP request
   * @param res The HTTP response
   * @param names A list of strategies to use
   */
  async parse (req, res, ...names) {
    const strategies = this.getStrategies(...names)
      .filter(current => current && typeof current.parse === 'function');

    debug('Strategies parsing HTTP header for authentication information', names);

    for (const authStrategy of strategies) {
      const value = await authStrategy.parse(req, res);

      if (value !== null) {
        return value;
      }
    }

    return null;
  }
}
