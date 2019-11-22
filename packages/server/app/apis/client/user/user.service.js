const { User } = require('./user.class');

module.exports = function () {
  new User().register('user');
};
