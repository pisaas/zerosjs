module.exports = function (app) {
  const client = require('./client');
  const admin = require('./admin');
  const consol = require('./console');

  app.configure(client);
  app.configure(admin);
  app.configure(consol);
};
