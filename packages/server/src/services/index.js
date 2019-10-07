const core = require('./core');
const sys = require('./sys');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(core);
  app.configure(sys);
};
