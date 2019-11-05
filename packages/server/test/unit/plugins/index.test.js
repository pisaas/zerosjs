const path = require('path');
const includeAll = require('include-all');
const async = require('async');
const _ = require('lodash');

describe('\'config\' load', () => {
  it('load config', (done) => {
    loadConfigFiles((err, result) => {
      console.log('load config -------->', result);
      done();
    });
  });
});

function loadConfigFiles (cb) {
  let pluginsPath = path.join(__dirname, '../../../app/plugins');

  console.log('pluginsPath ------>', pluginsPath);

  let stats = includeAll({
    optional: true,
    dontLoad: true,
    dirname   : pluginsPath,
    filter    : /(.+)\.js$/,
    depth: 2
  });

  let defs = {};

  _.forIn(stats, function(it, key) {
    if (!it.index) {
      return;
    }

    let defFnPath = path.resolve(pluginsPath, key);
    let defFn = require(defFnPath);

    defs[key] = defFn;
  });

  let plugins = {};

  Object.assign(plugins, defs, {
    logger: false
  });

  cb(undefined, plugins);
}