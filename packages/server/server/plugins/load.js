const path = require('path');
const async = require('async');
const includeAll = require('include-all');

const __initializePlugins = require('./initializePlugins');

module.exports = function(zeros) {
  const initializePlugins = __initializePlugins(zeros);

  return function (cb) {
    zeros.config.plugins = Object.assign({}, zeros.config.plugins);

    zeros.plugins = {};

    async.series([
      (cb) => {
        loadPluginDefinitions(zeros.plugins, cb);
      },
      (cb) => {
        initializePlugins(zeros.plugins, cb);
      }
    ], (err) => {
      if (err) { return cb(err); }

      // Inform any listeners that the initial, built-in plugins
      // are finished loading
      zeros.emit('plugins:ready');
      zeros.log.silly('Plugins are ready.');
      return cb();
    });
  };
};

function loadPluginDefinitions (plugins, cb) {
  let pluginsPath = zeros.config.paths.plugins;

  if (!pluginsPath) {
    return cb();
  }

  let stats = includeAll({
    optional: true,
    dontLoad: true,
    dirname   : pluginsPath,
    filter    : /(.+)\.js$/,
    depth: 2
  });

  let defFns = {};

  _.forIn(stats, function(it, key) {
    if (!it.index) {
      return;
    }

    let defFnPath = path.resolve(pluginsPath, key);
    let defFn = require(defFnPath);

    defFns[key] = defFn;
  });

  Object.assign(plugins, defFns, zeros.config.plugins);

  return cb(undefined, plugins);
}
