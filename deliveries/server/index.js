// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually start from.
// > Note: This is not required in order to start, but it is a convenient default.
process.chdir(__dirname);

var server;

try {
  server = require('./server');
} catch (err) {
  console.error(err.stack);
  return;
}

// Start server
server.start();

// 拦截关机信号
process.on('SIGINT', () => {
  server.stop((err) => {
    console.error(err);
    process.exit(err ? 1 : 0);
  });
});
