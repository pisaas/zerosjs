const mongoose = require('./mongoose');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(mongoose);
};
