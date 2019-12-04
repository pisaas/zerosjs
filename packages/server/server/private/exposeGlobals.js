/**
 * Module dependencies.
 */
require('date-utils');

const _ = require('lodash');
const async = require('async');

const errors = require('@zerosjs/errors');

const util = require('../util');

const QiniuFops = {
  thumb: 'imageView2/0/w/600/h/600/format/jpg',
  avatar: 'imageView2/0/w/200/h/200/format/jpg'
};

module.exports = function exposeGlobals() {
  var zeros = this;

  global['zeros'] = zeros;
  global['_'] = _;
  global['async'] = async;

  zeros.$errors = errors;
  zeros.util = util;
  
  initRescGlobal(zeros);
};

// 初始化resc全局变量
function initRescGlobal (app) {
  if (app.$resc) {
    return;
  }

  app.$resc = {
    QiniuFops,

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
    },

    thumbUrl (thumb, path, ts, fopName) {
      let fop = QiniuFops[fopName];

      if (!ts || !path || !fop) {
        return this.fullUrl(thumb);
      }

      // 5分钟后生效，（七牛处理缩略图预留5分钟时间）
      let activeDate = ts.addMinutes(5);
      if (Date.compare(new Date(), activeDate) > 0) {
        return this.fullUrl(thumb);
      }

      return this.fullUrl(path) + '?' + fop;
    }
  };
}
