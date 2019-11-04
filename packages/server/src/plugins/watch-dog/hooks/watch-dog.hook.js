const debug = require('debug')('@zerosjs/server/plugins/watch-dog');

/**
 * 看门狗，主要防止外部应用访问内部服务
 */
module.exports = {
  name: 'watch-dog',

  fn () {
    return (context) => {
      // 可在此加入守护代码
      
      return context;
    };
  }
};
