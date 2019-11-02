const client = require('./client');
const admin = require('./admin');
const consol = require('./console');

module.exports = function (app) {
  app.configure(client);
  app.configure(admin);
  app.configure(consol);
};
