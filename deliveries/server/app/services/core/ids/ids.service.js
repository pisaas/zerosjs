// Initializes the `users` service on path `/users`
const { Ids } = require('./ids.class');

module.exports = function (app) {
  // Initialize our service with any options it requires
  new Ids({}, app).register('ids', {});
};
