const errors = require('@zerosjs/errors');
const { AppIdKey } = require('../../common');
const { ApiService } = require('../../service');
const { handleConnection } = require('./app.hooks');

module.exports = function (app) {
  new Service().register(app, 'app', {
    adapterService: {
      path: 'data/apps'
    },
    hooks: {
      after: {
        get: [ handleConnection() ]
      }
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

  async patch (id, data, params) {
    if (!id) {
      throw new errors.BadRequest('请提供资源类型ID。');
    }

    let result = null;

    if (id === AppIdKey) {
      let curApp = await this.adapterService.get(data.id);
      
      result = await this.resetCurrentApp(curApp, params);
    }

    return result;
  }
}
