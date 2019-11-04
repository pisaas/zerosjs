const path = require('path');
const server = require('../../../server');

describe('\'zerosjs\' app start', () => {
  it('start a app', (done) => {
    const startDir = path.resolve(__dirname, '../../..');

    process.chdir(startDir);

    server.start((err) => {
      done(err);
    });
  });
});
