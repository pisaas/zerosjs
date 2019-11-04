/**
 * Module dependencies
 */

/**
 * Zeros.prototype.initialize()
 *
 * Start the Zeros server
 * NOTE: zeros.load() should be run first.
 *
 * @param {Function?} callback  [optional]
 *
 * @api private
 */

module.exports = function initialize(cb) {
  var zeros = this;

  // Callback is optional
  cb = cb || function(err) {
    if (err) { zeros.log.error(err); }
  };

  // Indicate that server is starting
  zeros.log.verbose('Starting app at ' + zeros.config.appPath + '...');

  var listeners = {
    sigusr2: function() {
      zeros.stop(function() {
        process.kill(process.pid, 'SIGUSR2');
      });
    },

    sigint: function() {
      zeros.stop(function (){
        process.exit();
      });
    },

    sigterm: function() {
      zeros.stop(function (){
        process.exit();
      });
    },

    exit: function() {
      if (!zeros._exiting) {
        zeros.stop();
      }
    }
  };

  // Add "beforeShutdown" events
  process.once('SIGUSR2', listeners.sigusr2);

  process.on('SIGINT', listeners.sigint);
  process.on('SIGTERM', listeners.sigterm);
  process.on('exit', listeners.exit);

  zeros._processListeners = listeners;

  // Fire the `ready` event
  // Since Express 4, the router is built in, so middlewares are divided between
  // pre-route and post-route. The way to tell when to do the split is via the
  // ready event
  // More info in lib/hooks/http/initialize.js:378
  zeros.emit('ready');

  cb();
};
