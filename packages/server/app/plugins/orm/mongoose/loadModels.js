const _ = require('lodash');
const async = require('async');

const __model = require('./model');

module.exports = function(zeros) {
  var Model = __model(zeros);

  return function loadModels(plugin, cb) {
    async.each(_.keys(plugin.models), (key, cb) => {
      let modelDef = plugin.models[key];

      let model = new Model(modelDef);

      model.load((err) => {
        if (err) {
          return cb(err);
        }
        
        plugin.models[key] = model;
        cb();
      });
    }, cb);
  };
};