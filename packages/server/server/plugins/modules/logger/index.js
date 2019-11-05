const CaptainsLog = require('captains-log');

module.exports = function definePlugin(zeros) {
  return {
    defaults:{
      log: {
        level: 'info'
      }
    },

    initialize: function (next) {
      // Get basic log functions
      const logger = CaptainsLog(zeros.config.log);

      // 考虑一些兼容性要求，这里加入info功能
      logger.log = logger.info;

      zeros.log = logger;

      return next();
    }
  };
};