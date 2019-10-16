const { configureDir } = require('../../lib/common/service');

module.exports = function (app) {
  configureDir(app, __dirname);
};
