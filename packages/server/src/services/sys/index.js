const regs = require('./regs/regs.service');
const orgs = require('./orgs/orgs.service');
const apps = require('./apps/apps.service');
const users = require('./users/users.service');

module.exports = function (app) {
  app.configure(regs);
  app.configure(orgs);
  app.configure(apps);
  app.configure(users);
};
