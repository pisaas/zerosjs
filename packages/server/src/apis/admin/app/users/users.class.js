const errors = require('@zerojs/errors');
const { ApiService } = require('../../service');

exports.Users = class Users extends ApiService {
  async get(code, params) {
    let { user } = params;

    if (!user || user.code !== code) {
      throw new errors.Forbidden('只允许获取本人的信息');
    }
    
    let usersService = zero.service('users');
    let userInfo = usersService.get(code);

    return userInfo;
  }

  async update (code, data, params) {
    let { user } = params;

    if (!user || user.code !== code) {
      throw new errors.Forbidden('只允许更新本人的信息');
    }
  }
};
