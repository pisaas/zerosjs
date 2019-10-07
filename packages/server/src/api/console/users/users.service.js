const { protectFields } = require('../../../hooks');
const { Users } = require('./users.class');

module.exports = function (app) {
  new Users().register(app, 'users', {
    hooks: {
      after: {
        all: [ protectFields('password') ]
      }
    }
  });
};
