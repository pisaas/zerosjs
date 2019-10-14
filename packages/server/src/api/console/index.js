const apps = require('./apps/apps.service');
const users = require('./users/users.service');
const orgs = require('./orgs/orgs.service');

module.exports = function (app) {
  app.configure(apps);
  app.configure(users);
  app.configure(orgs);
};
