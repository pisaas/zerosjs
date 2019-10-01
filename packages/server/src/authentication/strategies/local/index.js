const hashPassword = require('./hooks/hash-password');
const protect = require('./hooks/protect');
const { LocalStrategy } = require('./strategy');

module.exports = {
  hooks: {
    hashPassword,
    protect
  },
  LocalStrategy
};
