module.exports = function definePlugin(zeros) {
  return {
    initialize: function (next) {
      zeros.hooks({
        error (context) {
          zeros.log.error(`Error in '${context.path}' service method '${context.method}'`, context.error.stack);
        }
      });

      next();
    }
  };
};