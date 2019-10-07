const ids = require('./ids/ids.service');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(ids);
};
