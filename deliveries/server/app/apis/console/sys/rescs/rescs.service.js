const errors = require('@zerosjs/errors');
const { ApiService } = require('../../service');

module.exports = function () {
  new RescService().register('rescs', {
    adapterService: {
      path: 'sys/resc',
      methods: 'all'
    }
  });
};

class RescService extends ApiService {
  async get (id, params) {
    if (!id) {
      throw new errors.BadRequest('请提供资源类型ID。');
    }

    let result = null;
    
    if (id === 'uptoken') {
      result = await this.getUptoken(params);
    }

    return result;
  }

  async getUptoken (params) {
    let { appId, objId, prefix, bucket, extName } = params.query;

    if (appId && appId !== '0') {
      let app = await zeros.service('data/apps').get(appId);

      if (!app) {
        throw new errors.BadRequest('当前app未注册或不存在。');
      }
    } else {
      appId = '0';
    }

    return await this.adapterService.getUptoken({ appId, objId, prefix, bucket, extName });
  }
}
