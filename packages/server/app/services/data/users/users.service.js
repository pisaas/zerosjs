// Initializes the `users` service on path `/users`
const createModel = require('../../../models/user.model');

const { Users } = require('./users.class');
const hooks = require('./users.hooks');

module.exports = function (app) {
  const Model = createModel(app);

  new Users({ Model }, app).register('users', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'nickname' ],
    hooks
  });
};
