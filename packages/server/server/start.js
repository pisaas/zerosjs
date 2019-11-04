/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');

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
      zeros.load(configOverride, next);
    },

    function (next){
      zeros.initialize(next);
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
    zeros.log.info(chalk.grey(Array(56).join('-')));
    zeros.log.info(chalk.grey(':: ' + new Date()));
    zeros.log.blank();
    zeros.log.info('Environment : ' + zeros.config.environment);

    zeros.log.info('Port        : ' + zeros.config.port); // 12 - 4 = 8 spaces
    zeros.log.verbose('NODE_ENV  : ' + (process.env.NODE_ENV||chalk.gray('(not set)'))); // 12 - 8 - 2 = 2 spaces
    zeros.log.info(chalk.grey(Array(56).join('-')));

    // Emit 'started' event.
    zeros.emit('started');

    // Set `isStarted` (private dignostic flag)
    zeros.isStarted = true;

    return done(undefined, zeros);
  });
};
