const mongoose = require('mongoose');

const __loadModels = require('./loadModels');

module.exports = function(zeros) {
  return function (plugin, cb) {
    const loadModels = __loadModels(zeros);
  
    const mongodbCfg = zeros.get('datastores.mongodb');

    mongoose.connect(mongodbCfg.url, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch(err => {
      zeros.log.error(err);
      process.exit(1);
    });

    mongoose.Promise = global.Promise;

    zeros.$datastore = plugin.datastore = mongoose;

    loadModels(plugin, cb);
  };
};
