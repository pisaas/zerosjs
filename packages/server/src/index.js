/* eslint-disable no-console */
// const { logger } = require('./common');
// const app = require('./app');
// const port = app.get('port');
// const server = app.listen(port);

// process.on('unhandledRejection', (reason, p) =>
//   logger.error('Unhandled Rejection at: Promise ', p, reason)
// );

// server.on('listening', () =>
//   logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
// );

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually start from.
// > Note: This is not required in order to start, but it is a convenient default.
process.chdir(__dirname);

var zerosApp;

try {
  zerosApp = require('./app');
} catch (err) {
  console.error(err.stack);
  return;
}

// Start server
zerosApp.start();
