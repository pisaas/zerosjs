const { configureDir } = require('../../common/service');

module.exports = function (app) {
  configureDir(app, __dirname);
};
