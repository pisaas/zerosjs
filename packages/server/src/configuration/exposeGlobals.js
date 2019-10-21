const errors = require('@zero/errors');
const lodash = require('lodash');
const { json, logger, service } = require('../common');

module.exports = function exposeGlobals(app) {
  global['zero'] = app;
  global['_'] = lodash;

  app.$json = json;
  app.$logger = logger;
  app.$service = service;
  app.$errors = errors;
  
  initRescGlobal(app);
};

// 初始化resc全局变量
function initRescGlobal (app) {
  if (app.$resc) {
    return;
  }

  app.$resc = {
    fullUrl (path) {
      if (!path) {
        return path;
      }

      let rescCfg = app.get('sys.resc');
      let rescDomain = rescCfg.domains.default;

      if (path.indexOf(rescDomain) === 0) {
        return path;
      }

      return `${rescDomain}/${path}`;
    }
  };
}
