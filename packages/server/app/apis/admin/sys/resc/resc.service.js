const errors = require('@zerosjs/errors');
const { ApiService } = require('../../service');

module.exports = function () {
  new Service().register('resc', {
    adapterService: {
      path: 'sys/resc'
    }
  });
};

class Service extends ApiService {
  async get (id, params) {
    if (!id) {
      throw new errors.BadRequest('请提供资源类型ID。');
    }

    let result = null;

    switch (id) {
    case 'uptoken':
      result = await this.getUptoken(params);
      break;
    case 'check_transcoding':
      result = await this.checkPersistent(params);
      break;
    }

    return result;
  }

  async create (data, params) {
    let { user, app } = params;
    let { store, key, pfopid, rtype, name, extra } = data;

    if (!key) {
      throw new errors.BadRequest('请提供需要转存的资源。');
    }

    if (!store) {
      throw new errors.BadRequest('请提供资源存储方式。');
    }

    let rescData = {
      rtype,
      tmpKey: key,
      pfopid,
      name,
      extra
    };

    let result = await this.adapterService.store(store, rescData, { app, user });

    return result;
  }

  async getUptoken (params) {
    let { objid, prefix, bucket, rtype, extName } = params.query;
  
    return await this.adapterService.getUptoken({
      objid, prefix, bucket, rtype, extName
    }, params);
  }

  async checkPersistent (params) {
    let { id } = params.query;

    let rescModel = await this.adapterService.checkPersistent(id, params);

    return rescModel;
  }

  async rePersistent (params) {
    let { rid } = params.query;

    let rescModel = await this.adapterService.rePersistent(rid, params);

    return rescModel;
  }
}
