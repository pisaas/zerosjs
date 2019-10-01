const db = require('./db');

module.exports = function (app) {
  app.configure(db);
};
