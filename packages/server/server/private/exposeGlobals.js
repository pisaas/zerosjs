/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');

const errors = require('@zerosjs/errors');

module.exports = function exposeGlobals() {
  var zeros = this;

  global['zeros'] = zeros;
  global['_'] = _;
  global['async'] = async;

  zeros.$errors = errors;
  
  initRescGlobal(zeros);
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
