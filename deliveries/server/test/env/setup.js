const path = require('path');
const server = require('../../server');

module.exports = async function() {
  await new Promise((resolve, reject) => {
    const startDir = path.resolve(__dirname, '../..');
    process.chdir(startDir);

    server.start((err) => {
      if (err) { return reject(err); }
      global.zerosServer = server;
      global.zeros = server;

      return resolve();
    });
  });
};
