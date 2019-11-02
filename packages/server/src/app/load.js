/**
 * Module dependencies
 */

const _ = require('lodash');
const async = require('async');
const flaverr = require('flaverr');

const __Configuration = require('./configuration');
const __initializePlugins = require('./private/loadPlugins');

/**
 * @param  {ZeroApp} zero
 * @returns {Function}
 */
module.exports = function(zero) {
  var Configuration = __Configuration(zero);
  var initializePlugins = __initializePlugins(zero);

  /**
   * Expose loader start point.
   * (idempotent)
   *
   * @api public
   */
  return function load(configOverride, cb) {
    if (zero._exiting) {
      return cb(new Error('\n*********\nCannot load or start an app after it has already been stoped.\n\n'));
    }

    // Log a verbose log message about the fact that EVEN MORE verbosity
    // is available in `silly` mode.
    zero.log.verbose('• • • • • • • • • • • • • • • • • • • • • • • • • • • • • •');
    zero.log.verbose('•  Loading Zero with "verbose" logging enabled...        •');
    zero.log.verbose('•  (For even more details, try "silly".)                  •');
    zero.log.silly  ('•  Actually, looks like you\'re already using "silly"!     •');
    zero.log.verbose('•                                                         •');
    zero.log.verbose('• • • • • • • • • • • • • • • • • • • • • • • • • • • • • •');

    // configOverride is optional
    if (_.isFunction(configOverride)) {
      cb = configOverride;
      configOverride = {};
    }

    // Ensure override is an object and clone it (or make an empty object if it's not).
    // The shallow clone protects against the caller accidentally adding/removing props
    // to the config after Zero has loaded (but they could still mess with nested config).
    configOverride = configOverride || {};
    zero.config = _.clone(configOverride);


    // If host is explicitly specified, set `explicitHost`
    // (otherwise when host is omitted, Express will accept all connections via INADDR_ANY)
    if (configOverride.host) {
      configOverride.explicitHost = configOverride.host;
    }

    // Optionally expose services, models, zero, _, async, etc. as globals as soon as the
    // config loads.
    zero.on('plugin:config:loaded', zero.exposeGlobals);

    async.auto({
      // Apply core defaults and plugin-agnostic configuration,
      // esp. overrides including command-line options, environment variables,
      // and options that were passed in programmatically.
      config: [Configuration.load],

      // Verify that the combination of Zero environment and NODE_ENV is valid
      // as early as possible -- that is, as soon as we know for sure what the
      // Zero environment is.
      verifyEnv: ['config', function(results, cb) {
        verifyEnvironment();

        return cb();
      }],

      // Load plugins into memory, with their hooks
      plugins: ['verifyEnv', 'config', loadPlugins]
    }, ready__(cb));

    // Makes `app.load()` chainable
    return zero;
  };

  /**
   * Load plugins in parallel
   * let them work out dependencies themselves,
   * taking advantage of events fired from the zero object
   *
   * @api private
   */
  function loadPlugins(results, cb) {
    zero.plugins = {};

    async.series([
      function(cb) {
        loadPluginDefinitions(zero.plugins, cb);
      },

      function(cb) {
        initializePlugins(zero.plugins, cb);
      }
    ], function(err) {
      if (err) { return cb(err); }

      // Inform any listeners that the initial, built-in plugins
      // are finished loading
      zero.emit('plugins:ready');
      zero.log.silly('Plugins are ready.');
      return cb();
    });
  }

  /**
   * Load built-in plugin definitions
   * and put them into `plugins` (`zero.config.plugins`)
   *
   * @api private
   */
  function loadPluginDefinitions(plugins, cb) {
    // Mix in user-configured plugin definitions
    _.extend(plugins, zero.config.plugins);

    // Make sure these changes to the plugins object get applied
    // to zero.config.plugins to keep logic consistent
    // (I think we can get away w/o this, but leaving as a stub)
    // zero.config.plugins = plugins;

    return cb();
  }

  function verifyEnvironment() {
    // At this point, the Zero environment is set to its final value,
    // whether it came from the command line or a config file. So we
    // can now compare it to the NODE_ENV environment variable and
    // act accordingly.  This may involve changing NODE_ENV to "production",
    // which we want to do as early as possible since dependencies might
    // be relying on that value.

    // If the Zero environment is production, but NODE_ENV is undefined,
    // log a warning and change NODE_ENV to "production".
    if (zero.config.environment === 'production' && process.env.NODE_ENV !== 'production' ) {
      if (_.isUndefined(process.env.NODE_ENV)) {
        zero.log.debug('Detected Zero environment is "production", but NODE_ENV is `undefined`.');
        zero.log.debug('Automatically setting the NODE_ENV environment variable to "production".');
        zero.log.debug();
        process.env.NODE_ENV = 'production';
      } else {
        throw flaverr({ name: 'userError', code: 'E_INVALID_NODE_ENV' }, new Error('When the Zero environment is set to "production", NODE_ENV must also be set to "production" (but it was set to "' + process.env.NODE_ENV + '" instead).'));
      }
    }
  }

  /**
   * Returns function which is fired when Zero is ready to go
   *
   * @api private
   */
  function ready__(cb) {
    return function(err) {
      if (err) {
        return cb && cb(err);
      }

      zero.log.silly('All plugins were loaded successfully.');

      // If userconfig plugin is turned off, still load globals.
      if (zero.config.plugins) {
        zero.exposeGlobals();
      }

      // If the Zero environment is set to "production" but the Node environment isn't,
      // log a warning.
      if (zero.config.environment === 'production' && process.env.NODE_ENV !== 'production') {
        zero.log.warn('Detected Zero environment of `production`, but Node environment is `' + process.env.NODE_ENV + '`.\n' +
                       'It is recommended that in production mode, both the Zero and Node environments be set to `production`.');
      }

      cb && cb(null, zero);
    };
  }
};
