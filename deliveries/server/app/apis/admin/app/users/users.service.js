const { Users } = require('./users.class');

module.exports = function () {
  new Users().register('users');
};
