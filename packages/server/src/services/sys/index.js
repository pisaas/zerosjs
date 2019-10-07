const users = require('./users/users.service');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
};
