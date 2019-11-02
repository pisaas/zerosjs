const { ApiService } = require('../../service');

module.exports = function (app) {
  new Service().register(app, 'apps', {
    adapterService: {
      path: 'data/apps'
    }
  });
};

class Service extends ApiService {
  async get (id, params) {
    let { user } = params;

    let app = await this.adapterService.get(id);

    if (!app || app.uid !== user.id) {
      throw new zero.$errors.BadRequest('无法获取应用');
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
    let { user } = params;

    data.uid = user.id;
    let app = await this.adapterService.create(data);

    return app;
  }

  async patch (id, data, params) {
    let { user } = params;

    let app = await this.adapterService.get(id);

    if (!app || app.uid !== user.id) {
      throw new zero.$errors.BadRequest('无法获取应用');
    }

    let logo = data.logo;
    delete data.logo;

    app = await this.adapterService.patch(id, data);
    
    app = await this.adapterService.updateLogo(app, logo);

    return app;
  }
}
