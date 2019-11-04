module.exports = function definePlugin(zeros) {
  return {
    initialize: function (next) {
      return next();
    }
  };
};