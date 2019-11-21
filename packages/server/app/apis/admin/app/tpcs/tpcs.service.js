const { ApiService } = require('../../service');

module.exports = function (app) {
  new Service().register(app, 'tpcs', {
    adapterService: {
      path: 'data/tpcs'
    }
  });
};

class Service extends ApiService {
  async get (id, params) {
    let { user } = params;

    let app = await this.adapterService.get(id);

    if (!app || app.uid !== user.id) {
      throw new zeros.$errors.BadRequest('无法获取应用');
    }

    return app;
  }

  async find (params) {
    let { query, user } = params;
    
    query = Object.assign({}, params.query);
    query.uid = user.id;

    let apps = await this.adapterService.find({
      query
    });
    
    return apps;
  }

  async create (data, params) {
    let { app, user } = params;

    if (!data.catid) {
      throw new zeros.$errors.BadRequest('请提供类型id');
    }

    let tpcData = Object.assign({
      type: ''
    }, data, {
      uid: user.id,
      appid: app.id
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

    let logo = data.logo;
    delete data.logo;

    app = await this.adapterService.patch(id, data);
    
    app = await this.adapterService.updateLogo(app, logo);

    return app;
  }
}
