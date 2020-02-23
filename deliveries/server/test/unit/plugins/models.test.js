const path = require('path');
const includeAll = require('include-all');

describe('\'config\' load', () => {
  it('load config', (done) => {
    loadModelFiles((err, result) => {
      console.log('load config -------->', result);
      done();
    });
  });
});

function loadModelFiles (cb) {
  let modelsPath = path.join(__dirname, '../../../app/models');

  let models = includeAll({
    optional: true,
    dirname   : modelsPath,
    filter    : /(.+)\.model.js$/
  });

  cb(undefined, models);
}