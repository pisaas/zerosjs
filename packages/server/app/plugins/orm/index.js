
const async = require('async');
const includeAll = require('include-all');

module.exports = function (zeros) {
  return {
    hooks: require('./hooks'),

    initialize: function (next) {
      const loadModels = require('./mongoose')(zeros);

      let plugin = this;

      plugin.models = {};

      async.series([
        (cb) => {
          loadModelDefinitions(plugin, cb);
        },
        (cb) => {
          loadModels(plugin, cb);
        }
      ], next);
    }
  };
};

function loadModelDefinitions (plugin, cb) {
  const modelsPath = zeros.get('paths.models');

  let defFns = includeAll({
    optional: true,
    dirname   : modelsPath,
    filter    : /(.+)\.model.js$/
  });

  let defs = {};

  _.forIn(defFns, (fn, key) => {
    defs[key] = fn();
  });

  _.extend(plugin.models, defs);

  cb();
}
