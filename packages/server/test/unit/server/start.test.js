const path = require('path');
const server = require('../../../server');

describe('\'zerosjs\' app start', () => {
  afterAll((done) => {
    server.stop(done);
  });

  it('start a app', (done) => {
    const startDir = path.resolve(__dirname, '../../..');

    process.chdir(startDir);

    server.start((err) => {
      // let authCfg = server.get('authentication');
      // console.log('authCfg ------>', authCfg);

      // console.log('plugins ------>', server.plugins);

      done(err);
    });
  });
});
