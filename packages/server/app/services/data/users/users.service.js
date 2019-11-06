const { Users } = require('./users.class');
const hooks = require('./users.hooks')();

module.exports = function (app) {
  new Users('user', app).register('users', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'nickname' ],
    hooks
  });
};
