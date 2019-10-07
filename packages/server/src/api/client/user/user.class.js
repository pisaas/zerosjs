const errors = require('@zero/errors');
const { ApiService } = require('../service');

exports.User = class User extends ApiService {
  async get(id, params) {
    let { user } = params;

    // if (!user || user.id !== id) {
    //   throw new errors.Forbidden('只允许获取本人的信息');
    // }
    
    let usersService = this.app.service('sys/users');
    let userInfo = await usersService.get(id);

    return userInfo;
  }

  async create (data, params) {
    let usersService = this.app.service('sys/users');
    let userInfo = await usersService.create(data, params);
    
    return userInfo;
  }

  async update (id, data, params) {
    let { user } = params;

    if (!user || user.id !== id) {
      throw new errors.Forbidden('只允许更新本人的信息');
    }
  }
};
