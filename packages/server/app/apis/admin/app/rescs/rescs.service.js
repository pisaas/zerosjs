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
      utype: 'app'
    });

    let results = await this.adapterService.find({ query });
    
    return results;
  }

  async create (data, params) {
    let { app, user } = params;

    if (!data.catid) {
      throw new zeros.$errors.BadRequest('请提供类型id');
    }

    let tpcData = Object.assign({
      type: ''
    }, data, {
      appid: app.id,
      uid: user.id,
      uname: user.displayName
    });

    // TODO: 根据类别为topic设置附加属性
    
    let result = await this.adapterService.create(tpcData);

    return result;
  }

  async patch (id, data, params) {
    let { user } = params;

    let app = await this.adapterService.get(id);

    if (!app || app.uid !== user.id) {
      throw new zeros.$errors.BadRequest('无法获取应用');
    }

    app = await this.adapterService.patch(id, data);

    return app;
  }

  async remove (id, params) {
    let { app, user } = params;
    let { ids } = params.query;

    if (!ids || !ids.length) {
      throw new zeros.$errors.BadRequest('请提供要删除的主题id');
    }

    let query = Object.assign({
      appid: app.id,
      uid: user.id,
      pubed: false,
      id: { $in: ids }
    });

    let tpcs = await this.adapterService.remove(null, {
      query
    });
    
    return tpcs;
  }
}
