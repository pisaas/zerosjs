const { ApiService } = require('../../service');

module.exports = function () {
  new Service().register('rescs', {
    adapterService: {
      path: 'data/rescs'
    }
  });
};

class Service extends ApiService {
  async get (id, params) {
    let { app } = params;

    let result = await this.adapterService.get(id);

    if (!result || result.appid !== app.id) {
      throw new zeros.$errors.BadRequest('资源不存在');
    }

    return result;
  }

  async find (params) {
    let { app, query } = params;
    
    query = Object.assign({}, query, {
      appid: app.id,
      stype: 'app'
    });

    let results = await this.adapterService.find({ query });
    
    return results;
  }

  // 自能修改extra中的数据
  async patch (id, data, params) {
    let { app } = params;

    let rescModel = await this.adapterService.get(id);

    if (!rescModel || app.id !== rescModel.appid) {
      throw new zeros.$errors.BadRequest('获取资源失败');
    }

    if (rescModel.frzn) {
      throw new zeros.$errors.BadRequest('资源已冻结');
    }

    let updates = {};
    
    if (rescModel.rtype === 'image') {
      updates = _.pick(data, ['name']);
    } else {
      let extra = Object.assign({}, rescModel.extra);

      if (rescModel.rtype === 'audio') {
        updates = _.pick(data, ['name', 'thumb', 'desc']);
      } else if (rescModel.rtype === 'video') {
        updates = _.pick(data, ['name', 'thumb', 'desc']);

        if (data.thumbType) {
          extra.thumbType = data.thumbType;
        }

        if (!isNaN(data.thumbOffset)) {
          extra.thumbOffset = data.thumbOffset;
        }

        updates.extra = extra;
      }

      if (data.thumbOrigin) {
        extra.thumbOrigin = data.thumbOrigin;
        updates.extra = extra;
      }
    }

    const rescService = zeros.service('sys/resc');

    rescModel = await rescService.patch(id, updates);

    return rescModel;
  }

  async remove (id, params) {
    let { app } = params;
    let { ids } = params.query;

    if (id) {
      ids = [id];
    }

    if (!ids || !ids.length) {
      throw new zeros.$errors.BadRequest('请提供要删除的资源');
    }

    if (ids.length > 50) {
      throw new zeros.$errors.BadRequest('一次删除不能超过50条资源信息');
    }

    let findResult = await this.adapterService.find({
      query: {
        appid: app.id,
        id: { $in: ids },
        frzn: { $ne: true }
      }
    });

    if (!findResult.total) {
      return {};
    }

    let removeIds = findResult.data.map((it) => {
      return it.id;
    });

    const rescService = zeros.service('sys/resc');

    let removeOps = removeIds.map((it) => {
      return rescService.remove(it);
    });

    let results = await Promise.all(removeOps);
    
    return results;
  }
}
