const { ApiService } = require('../../service');

module.exports = function () {
  new Service().register('apps', {
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
    const appService = zeros.service('sys/app');
    let app = await appService.create(data, params);

    return app;
  }

  async patch (id, data, params) {
    let { user } = params;

    let app = await this.adapterService.get(id);

    if (!app || app.uid !== user.id) {
      throw new zeros.$errors.BadRequest('无法获取应用');
    }

    const appService = zeros.service('sys/app');
    app = await appService.patch(id, data, params);

    return app;
  }
}
