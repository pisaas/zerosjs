const { ApiService } = require('../../service');

module.exports = function (app) {
  new Apps().register('apps', {
    adapterService: {
      path: 'data/apps',
      methods: 'all'
    }
  });
};

class Apps extends ApiService {
  async patch (id, data, params) {
    if (!data) {
      throw new zeros.$errors.BadRequest('请提供需要更新的数据。');
    }

    let logo = data.logo;
    delete data.logo;

    let app = await this.adapterService.patch(id, data, params);

    if (!app) {
      throw new zeros.$errors.BadRequest('应用不存在');
    }
    
    app = await this.adapterService.updateLogo(app, logo);
    
    return app;
  }
}
