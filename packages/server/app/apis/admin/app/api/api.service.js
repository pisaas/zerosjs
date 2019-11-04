const errors = require('@zerosjs/errors');
const { ApiService } = require('../../../service');

module.exports = function (app) {
  new Service().register(app, 'api');
};

class Service extends ApiService {
  async get (id, params) {
    if (!id) {
      throw new errors.BadRequest('请提供资源类型ID。');
    }

    const { user } = params;

    let result = null;
    
    if (id === 'key') {
      // 获取apikey
    }

    return result;
  }
}
