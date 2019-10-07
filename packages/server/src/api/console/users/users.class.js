const errors = require('@zero/errors');
const { ApiService } = require('../service');

exports.Users = class Users extends ApiService {
  async get(id) {
    let usersService = this.app.service('sys/users');
    let userInfo = usersService.get(id);

    return userInfo;
  }

  async update (code, data, params) {
    let { user } = params;
  }
};
