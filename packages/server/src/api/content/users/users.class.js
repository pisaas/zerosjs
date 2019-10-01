const errors = require('@zero/errors');
const { ApiService } = require('../base');

exports.Users = class Users extends ApiService {
  async get(code, params) {
    let { user } = params;

    // 只允许获取本人的信息
    if (!user || user.code !== code) {
      throw new errors.Forbidden();
    }

    return {
      code,
      read: false,
      text: 'Feathers is great!',
      createdAt: new Date().getTime()
    };
  }

  async update (code, data, params) {
    let { user } = params;

    // 只允许更新本人的信息
    if (!user || user.code !== code) {
      throw new errors.Forbidden();
    }

    
  }
};
