const content = require('./content');
const admin = require('./admin');

module.exports = function (app) {
  app.configure(content);
  app.configure(admin);
};
