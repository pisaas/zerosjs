/**
 * Module dependencies
 */

const _ = require('lodash');
const async = require('async');
const flaverr = require('flaverr');

const __Config = require('./config');
const __Plugins = require('./plugins');

/**
 * @param  {ZerosApp} zeros
 * @returns {Function}
 */
module.exports = function(zeros) {
  var Config = __Config(zeros);
  var Plugins = __Plugins(zeros);

  /**
   * Expose loader start point.
   * (idempotent)
   *
   * @api public
   */
  return function load(configOverride, cb) {
    if (zeros._exiting) {
      return cb(new Error('\n*********\nCannot load or start an app after it has already been stoped.\n\n'));
    }

    // Log a verbose log message about the fact that EVEN MORE verbosity
    // is available in `silly` mode.
    zeros.log.verbose('• • • • • • • • • • • • • • • • • • • • • • • • • • • • • •');
    zeros.log.verbose('•  Loading Zeros with "verbose" logging enabled...        •');
    zeros.log.verbose('•  (For even more details, try "silly".)                  •');
    zeros.log.silly  ('•  Actually, looks like you\'re already using "silly"!     •');
    zeros.log.verbose('• • • • • • • • • • • • • • • • • • • • • • • • • • • • • •');

    // configOverride is optional
    if (_.isFunction(configOverride)) {
      cb = configOverride;
      configOverride = {};
    }

    // Ensure override is an object and clone it (or make an empty object if it's not).
    // The shallow clone protects against the caller accidentally adding/removing props
    // to the config after Zeros has loaded (but they could still mess with nested config).
    configOverride = configOverride || {};
    zeros.config = _.clone(configOverride);


    // If host is explicitly specified, set `explicitHost`
    // (otherwise when host is omitted, Express will accept all connections via INADDR_ANY)
    if (configOverride.host) {
      configOverride.explicitHost = configOverride.host;
    }

    // Optionally expose services, models, zeros, _, async, etc. as globals as soon as the
    // config loads.
    zeros.on('configs:loaded', zeros.exposeGlobals);

    async.auto({
      // Apply core defaults and plugin-agnostic configuration,
      // esp. overrides including command-line options, environment variables,
      // and options that were passed in programmatically.
      config: [Config.load],

      // Verify that the combination of Zeros environment and NODE_ENV is valid
      // as early as possible -- that is, as soon as we know for sure what the
      // Zeros environment is.
      verifyEnv: ['config', function(results, cb) {
        verifyEnvironment();

        return cb();
      }],

      // Load plugins into memory, with their hooks
      plugins: ['verifyEnv', 'config', (results, cb) => {
        Plugins.load(cb);
      }]
    }, ready__(cb));

    // Makes `app.load()` chainable
    return zeros;
  };

  function verifyEnvironment() {
    // At this point, the Zeros environment is set to its final value,
    // whether it came from the command line or a config file. So we
    // can now compare it to the NODE_ENV environment variable and
    // act accordingly.  This may involve changing NODE_ENV to "production",
    // which we want to do as early as possible since dependencies might
    // be relying on that value.

    // If the Zeros environment is production, but NODE_ENV is undefined,
    // log a warning and change NODE_ENV to "production".
    if (zeros.config.environment === 'production' && process.env.NODE_ENV !== 'production' ) {
      if (_.isUndefined(process.env.NODE_ENV)) {
        zeros.log.debug('Detected Zeros environment is "production", but NODE_ENV is `undefined`.');
        zeros.log.debug('Automatically setting the NODE_ENV environment variable to "production".');
        zeros.log.debug();
        process.env.NODE_ENV = 'production';
      } else {
        throw flaverr({ name: 'userError', code: 'E_INVALID_NODE_ENV' }, new Error('When the Zeros environment is set to "production", NODE_ENV must also be set to "production" (but it was set to "' + process.env.NODE_ENV + '" instead).'));
      }
    }
  }

  /**
   * Returns function which is fired when Zeros is ready to go
   *
   * @api private
   */
  function ready__(cb) {
    return function(err) {
      if (err) {
        return cb && cb(err);
      }

      zeros.log.silly('All plugins were loaded successfully.');

      // If the Zeros environment is set to "production" but the Node environment isn't,
      // log a warning.
      if (zeros.config.environment === 'production' && process.env.NODE_ENV !== 'production') {
        zeros.log.warn('Detected Zeros environment of `production`, but Node environment is `' + process.env.NODE_ENV + '`.\n' +
                       'It is recommended that in production mode, both the Zeros and Node environments be set to `production`.');
      }

      cb && cb(null, zeros);
    };
  }
};
