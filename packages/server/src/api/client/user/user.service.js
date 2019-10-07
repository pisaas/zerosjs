const { protectFields } = require('../../../hooks');
const { User } = require('./user.class');

module.exports = function (app) {
  new User().register(app, 'user', {
    hooks: {
      after: {
        all: [ protectFields('password') ]
      }
    }
  });
};
