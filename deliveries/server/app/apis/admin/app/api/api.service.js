const errors = require('@zerosjs/errors');
const { ApiService } = require('../../../service');

module.exports = function () {
  new Service().register('api');
};

class Service extends ApiService {
  async get (id, params) {
    if (!id) {
      throw new errors.BadRequest('请提供资源类型ID。');
    }

    // eslint-disable-next-line no-unused-vars
    const { user } = params;

    let result = null;
    
    if (id === 'key') {
      // 获取apikey
    }

    return result;
  }
}
