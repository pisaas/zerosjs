var _ = require('lodash');
var async = require('async');

module.exports = function stop(options, cb) {
  var zeros = this;

  zeros.log.verbose('Stoping zeros...');

  // `options` is optional.
  if (_.isFunction(options)) {
    cb = options;
    options = undefined;
  }

  // Callback is optional
  cb = cb || function(err) {
    if (err)  { return zeros.log.error(err); }
  };

  options = options || {};
  options.delay = options.delay || 100;

  // Flag `zeros._exiting` as soon as the zeros has begun to shutdown.
  // This may be used by core plugins and other parts of core.
  // (e.g. to stop handling HTTP requests and prevent ugly error msgs)
  zeros._exiting = true;

  var beforeShutdown = (zeros.config && zeros.config.beforeShutdown) || function(cb) {
    return cb();
  };

  // Wait until beforeShutdown logic runs
  beforeShutdown(function(err) {
    // If an error occurred, don't stop-- still go ahead and take care of other teardown tasks.
    if (err) {
      zeros.log.error(err);
    }

    // Try to kill all child processes
    _.each(zeros.childProcesses, function kill(childProcess) {
      zeros.log.silly('Sent kill signal to child process (' + childProcess.pid + ')...');
      try {
        childProcess.kill('SIGINT');
      } catch (e) {
        zeros.log.error('While lowering Zeros zeros: received error killing child process:', e.stack);
      }
    });

    // Shut down HTTP server
    zeros.emit('stop');

    async.series([
      function shutdownSockets(cb) {
        // If the sockets hook is disabled, skip this.
        // Also skip if the socket server is piggybacking on the main HTTP server, to avoid
        // the onClose event possibly being called multiple times (because you can't tell
        // socket.io to close without it trying to close the http server).  If we're piggybacking
        // we'll call zeros.io.close in the main "shutdownHTTP" code below.
        if (!_.isObject(zeros.plugins) || !zeros.plugins.sockets || !zeros.io || (zeros.io && zeros.io.httpServer && zeros.plugins.http.server === zeros.io.httpServer)) {
          return cb();
        }

        var timeOut;

        try {
          zeros.log.silly('Shutting down socket server...');
          timeOut = setTimeout(function() {
            zeros.io.httpServer.removeListener('close', onClose);
            return cb();
          }, 100);
          zeros.io.httpServer.unref();
          zeros.io.httpServer.once('close', onClose);
          zeros.io.close();
        } catch (e) {
          zeros.log.verbose('Error occurred closing socket server: ', e);
          clearTimeout(timeOut);
          return cb();
        }

        function onClose() {
          zeros.log.silly('Socket server shut down successfully.');
          clearTimeout(timeOut);
          cb();
        }

      },

      function shutdownHTTP(cb) {
        if (!_.isObject(zeros.plugins) || !zeros.plugins.http || !zeros.plugins.http.server) {
          return cb();
        }

        var timeOut;

        try {
          zeros.log.silly('Shutting down HTTP server...');

          // Allow process to exit once this server is closed
          zeros.plugins.http.server.unref();

          // If we have a socket server and it's piggybacking on the main HTTP server, tell
          // socket.io to close now.  This may call `.close()` on the HTTP server, which will
          // hzerosen again below, but the second synchronous call to .close() will have no
          // additional effect.  Leaving this as-is in case future versions of socket.io
          // DON'T automatically close the http server for you.
          if (zeros.io && zeros.io.httpServer && zeros.plugins.http.server === zeros.io.httpServer) {
            zeros.io.close();
          }

          // If the "hard shutdown" option is on, destroy the server immediately,
          // severing all connections
          if (options.hardShutdown) {
            zeros.plugins.http.destroy();
          }
          // Otherwise just stop the server from accepting new connections,
          // and wait options.delay for the existing connections to close
          // gracefully before destroying.
          else {
            timeOut = setTimeout(zeros.plugins.http.destroy, options.delay);
            zeros.plugins.http.server.close();
          }

          // Wait for the existing connections to close
          zeros.plugins.http.server.once('close', function () {
            zeros.log.silly('HTTP server shut down successfully.');
            clearTimeout(timeOut);
            cb();
          });

        } catch (e) {
          zeros.log.verbose('Error occurred closing HTTP server: ', e);
          clearTimeout(timeOut);
          return cb();
        }
      },

      function removeListeners(cb) {
        // Manually remove all event listeners
        _.each(_.keys(zeros._events)||[], function (eventName){
          zeros.removeAllListeners(eventName);
        });

        var listeners = zeros._processListeners;
        if (listeners) {
          process.removeListener('SIGUSR2', listeners.sigusr2);
          process.removeListener('SIGINT', listeners.sigint);
          process.removeListener('SIGTERM', listeners.sigterm);
          process.removeListener('exit', listeners.exit);
        }
        zeros._processListeners = null;

        cb();
      },
    ], function (err) {
      if (err) {
        // This should never hzerosen because `err` is never passed in any of the async
        // functions above.  Still, just to be safe, we set up an error log.
        zeros.log.error('While stoping Zeros zeros: received unexpected error:', err.stack);
        return cb(err);
      }
      return cb();
    });
  });
};
