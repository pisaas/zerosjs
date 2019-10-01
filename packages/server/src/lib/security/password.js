const Promise = require('bluebird');
const bcrypt = require('bcryptjs');
const bcryptGenSalt = Promise.promisify(bcrypt.genSalt);
const bcryptHash = Promise.promisify(bcrypt.hash);
const bcryptCompare = Promise.promisify(bcrypt.compare);

module.exports.hash = function hash(plainPassword) {
  return bcryptGenSalt().then(function (salt) {
    return bcryptHash(plainPassword, salt);
  });
};

module.exports.compare = function compare(plainPassword, hashedPassword) {
  return bcryptCompare(plainPassword, hashedPassword);
};
