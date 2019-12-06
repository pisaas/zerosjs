
const async = require('async');
const includeAll = require('include-all');

const ModelStatusNames= {
  new: '新建',
  draft: '草稿',
  frzn: '已冻结',
  pubed: '已发布',
  unpubed: '未发布',
  transcoding: '转码中',
  transcoding_failed: '转码失败',
  transcoding_no_opid: '没有转码号',
};

module.exports = function (zeros) {
  return {
    hooks: require('./hooks'),

    initialize: function (next) {
      loadModelGlobals(zeros);

      const loadModels = require('./mongoose')(zeros);

      let plugin = this;

      plugin.modelDefs = {};

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

function loadModelGlobals (zeros) {
  if (zeros.$model) {
    return;
  }

  zeros.$model = {
    ModelStatusNames,

    statusName (status) {
      return ModelStatusNames[status] || status;
    }
  };
}

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

  _.extend(plugin.modelDefs, defs);

  cb();
}
