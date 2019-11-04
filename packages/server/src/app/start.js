/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');

/**
 * Zeros.prototype.start()
 *
 * Load the app, then bind process listeners and emit the internal "ready" event.
 * The "ready" event is listened for by core hooks; for example, the HTTP hook uses
 * it to start listening for requests.
 *
 * > This method also logs the ASCII art for the characteristic ship.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param {Dictionary?} configOverride
 *        Overrides that will be deep-merged (w/ precedence) on top of existing configuration.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @callback {Function?} done
 *        @param {Error?} err
 *
 * A Node-style callback that wil be triggered when the lift has completed (one way or another)
 * > If the `done` callback is omitted, then:
 * >  • If the lift fails, Zeros will log the underlying fatal error using `zeros.log.error()`.
 * >  • Otherwise, Zeros will log "App lifted successfully." using `zeros.log.verbose()`.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @api public
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
module.exports = function start(configOverride, done) {
  var zeros = this;

  // configOverride is optional.
  if (_.isFunction(configOverride)) {
    done = configOverride;
    configOverride = {};
  }

  // Callback is optional (but recommended.)
  done = done || function defaultCallback(err) {
    if (err) {
      zeros.log.error('Failed to start app:',err);
      return;
    }

    zeros.log.verbose('Zeros app started successfully.');
  };

  async.series([
    function (next) {
      // zeros.load(configOverride, next);
      next();
    },

    function (next){
      // zeros.initialize(next);
      next();
    },
  ], function whenZerosIsReady(err) {
    if (err) {
      zeros.stop(function (additionalErrStopingZeros){
        if (additionalErrStopingZeros) {
          zeros.log.error('When trying to stop the app as a result of a failed start, encountered an error:', additionalErrStopingZeros);
        }
        return done(err);
      });
      return;
    }

    zeros.log.info(('Server started in `' + zeros.config.appPath + '`'));

    zeros.log.info(('To shut down Zeros, press <CTRL> + C at any time.'));
    zeros.log.blank();
    zeros.log(chalk.grey(Array(56).join('-')));
    zeros.log(chalk.grey(':: ' + new Date()));
    zeros.log.blank();
    zeros.log('Environment : ' + zeros.config.environment);

    zeros.log('Port        : ' + zeros.config.port); // 12 - 4 = 8 spaces
    zeros.log.verbose('NODE_ENV  : ' + (process.env.NODE_ENV||chalk.gray('(not set)'))); // 12 - 8 - 2 = 2 spaces
    zeros.log(chalk.grey(Array(56).join('-')));

    // Emit 'started' event.
    zeros.emit('started');

    // Set `isStarted` (private dignostic flag)
    zeros.isStarted = true;

    return done(undefined, zeros);
  });
};
