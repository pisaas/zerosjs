module.exports = function (app) {
  const core = require('./core');
  const data = require('./data');
  const open = require('./open');
  const sys = require('./sys');

  app.configure(core);
  app.configure(data);
  app.configure(open);
  app.configure(sys);
};
