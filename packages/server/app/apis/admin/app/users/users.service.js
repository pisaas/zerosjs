const { Users } = require('./users.class');

module.exports = function (app) {
  new Users().register('users');
};
