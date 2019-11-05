const serviceUtils = require('./utils');

module.exports = function (zeros) {
  return {
    initialize: function (next) {
      const services = require(zeros.config.paths.services);

      zeros.$service = serviceUtils;

      zeros.after([
        'plugin:orm:loaded'
      ], () => {
        zeros.configure(services);
        return next();
      });
    }
  };
};
