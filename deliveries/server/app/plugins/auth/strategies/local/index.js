const hashPassword = require('./hooks/hash-password');
const { LocalStrategy } = require('./strategy');

module.exports = {
  hooks: {
    hashPassword
  },
  LocalStrategy
};
