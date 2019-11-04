const CaptainsLog = require('captains-log');

module.exports = function definePlugin(zeros) {
  return {
    defaults:{
      log: {
        level: 'info'
      }
    },

    initialize: function (next) {
      zeros.after(['plugin:mongoose:loaded', 'plugin:socketio:loaded'], () => {
        console.log('plugin logger1 initialize------------>');
      });
      
      console.log('plugin logger2 initialize------------>');

      // Get basic log functions
      const log = CaptainsLog(zeros.config.log);
      zeros.log = log;

      return next();
    }
  };
};