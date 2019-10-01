const users = require('./users/users.service');

module.exports = function (app) {
  app.configure(users);
};
