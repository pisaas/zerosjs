/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');

/**
 * Zero.prototype.start()
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
 * >  • If the lift fails, Zero will log the underlying fatal error using `zero.log.error()`.
 * >  • Otherwise, Zero will log "App lifted successfully." using `zero.log.verbose()`.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @api public
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
module.exports = function start(configOverride, done) {
  var zero = this;

  // configOverride is optional.
  if (_.isFunction(configOverride)) {
    done = configOverride;
    configOverride = {};
  }

  // Callback is optional (but recommended.)
  done = done || function defaultCallback(err) {
    if (err) {
      zero.log.error('Failed to start app:',err);
      return;
    }

    zero.log.verbose('Zero app started successfully.');
  };

  async.series([
    function (next) {
      zero.load(configOverride, next);
    },

    function (next){
      zero.initialize(next);
    },
  ], function whenZeroIsReady(err) {
    if (err) {
      zero.stop(function (additionalErrStopingZero){
        if (additionalErrStopingZero) {
          zero.log.error('When trying to stop the app as a result of a failed start, encountered an error:', additionalErrStopingZero);
        }
        return done(err);
      });
      return;
    }

    zero.log.info(('Server started in `' + zero.config.appPath + '`'));

    zero.log.info(('To shut down Zero, press <CTRL> + C at any time.'));
    zero.log.blank();
    zero.log(chalk.grey(Array(56).join('-')));
    zero.log(chalk.grey(':: ' + new Date()));
    zero.log.blank();
    zero.log('Environment : ' + zero.config.environment);

    zero.log('Port        : ' + zero.config.port); // 12 - 4 = 8 spaces
    zero.log.verbose('NODE_ENV  : ' + (process.env.NODE_ENV||chalk.gray('(not set)'))); // 12 - 8 - 2 = 2 spaces
    zero.log(chalk.grey(Array(56).join('-')));

    // Emit 'started' event.
    zero.emit('started');

    // Set `isStarted` (private dignostic flag)
    zero.isStarted = true;

    return done(undefined, zero);
  });
};
