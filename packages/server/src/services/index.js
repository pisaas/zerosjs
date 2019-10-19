const core = require('./core');
const data = require('./data');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(core);
  app.configure(data);
};
