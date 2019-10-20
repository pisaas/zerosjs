const core = require('./core');
const data = require('./data');
const sys = require('./sys');

module.exports = function (app) {
  app.configure(core);
  app.configure(data);
  app.configure(sys);
};
