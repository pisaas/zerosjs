/**
 * Module dependencies
 */

/**
 * Zero.prototype.initialize()
 *
 * Start the Zero server
 * NOTE: zero.load() should be run first.
 *
 * @param {Function?} callback  [optional]
 *
 * @api private
 */

module.exports = function initialize(cb) {
  var zero = this;

  // Callback is optional
  cb = cb || function(err) {
    if (err) { zero.log.error(err); }
  };

  // Indicate that server is starting
  zero.log.verbose('Starting app at ' + zero.config.appPath + '...');

  var listeners = {
    sigusr2: function() {
      zero.stop(function() {
        process.kill(process.pid, 'SIGUSR2');
      });
    },

    sigint: function() {
      zero.stop(function (){
        process.exit();
      });
    },

    sigterm: function() {
      zero.stop(function (){
        process.exit();
      });
    },

    exit: function() {
      if (!zero._exiting) {
        zero.stop();
      }
    }
  };

  // Add "beforeShutdown" events
  process.once('SIGUSR2', listeners.sigusr2);

  process.on('SIGINT', listeners.sigint);
  process.on('SIGTERM', listeners.sigterm);
  process.on('exit', listeners.exit);

  zero._processListeners = listeners;

  // Fire the `ready` event
  // Since Express 4, the router is built in, so middlewares are divided between
  // pre-route and post-route. The way to tell when to do the split is via the
  // ready event
  // More info in lib/hooks/http/initialize.js:378
  zero.emit('ready');

  cb();
};
