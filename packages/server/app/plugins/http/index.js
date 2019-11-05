const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const Express = require('@zerosjs/express');

module.exports = function definePlugin(zeros) {
  return {
    initialize: function (next) {
      let self = this;
      const httpCfg = zeros.get('http', {});

      zeros.use(helmet());
      zeros.use(cors());
      zeros.use(compress());
      zeros.use(Express.json());
      zeros.use(Express.urlencoded({ extended: true }));
      zeros.use(favicon(path.join(httpCfg.public, 'favicon.ico')));

      zeros.use('/', Express.static(httpCfg.public));

      zeros.configure(Express.rest());

      zeros.on('plugins:ready', () => {
        zeros.use(Express.notFound());
        zeros.use(Express.errorHandler({
          logger: zeros.log
        }));


        const port = zeros.get('port');
        const server = zeros.listen(port);

        self.server = server;

        process.on('unhandledRejection', (reason, p) =>
          zeros.log.error('Unhandled Rejection at: Promise ', p, reason)
        );

        server.on('listening', () =>
          zeros.log.info('Zeros application started on http://%s:%d', zeros.get('host'), port)
        );


        var openTcpConnections = {};

        // Listen for `connection` events on the raw HTTP server.
        server.on('connection', function _onNewTCPConnection(tcpConnection) {
          var key = tcpConnection.remoteAddress + ':' + tcpConnection.remotePort;
          openTcpConnections[key] = tcpConnection;
          tcpConnection.on('close', function() {
            delete openTcpConnections[key];
          });
        });

        self.destroy = function(done) {
          zeros.log.verbose('Destroying http server...');
          server.close(done);

          // FUTURE: consider moving this loop ABOVE `sails.hooks.http.server.close(done)`
          // for clarity (since at this point we've passed control via `done`)
          for (var key in openTcpConnections) {
            openTcpConnections[key].destroy();
          }
        };
      });

      return next();
    }
  };
};