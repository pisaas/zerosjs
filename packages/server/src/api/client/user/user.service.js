const { User } = require('./user.class');

module.exports = function (app) {
  new User().register(app, 'user');
};
