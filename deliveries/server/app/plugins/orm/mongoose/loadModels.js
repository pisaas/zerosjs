const _ = require('lodash');
const async = require('async');

const __model = require('./Model');

module.exports = function(zeros) {
  var Model = __model(zeros);

  return function loadModels(plugin, cb) {
    async.each(_.keys(plugin.modelDefs), (key, cb) => {
      let modelDef = plugin.modelDefs[key];

      // 设置key为默认modelName
      if (!modelDef.modelName) {
        modelDef.modelName = key;
      }


      new Model(modelDef).load(cb);
    }, cb);
  };
};
