const debug = require('debug')('@zerojs/server/hooks/watch-dog');

/**
 * 看门狗，主要防止外部应用访问内部服务
 */
module.exports = function () {
  return (context) => {
    // 可在此加入守护代码
    
    return context;
  };
};
