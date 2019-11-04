const hashPassword = require('./hooks/hash-password');
const protect = require('./hooks/protect');
const { LocalStrategy } = require('./strategy');

exports.hooks = { hashPassword, protect };
exports.LocalStrategy = LocalStrategy;
