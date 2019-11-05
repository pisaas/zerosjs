module.exports = function (zeros) {
  return {
    initialize: function (next) {
      const apis = require(zeros.config.paths.apis);

      zeros.after([
        'plugin:services:loaded',
        'plugin:http:loaded'
      ], () => {
        zeros.configure(apis);
        return next();
      });
    }
  };
};
