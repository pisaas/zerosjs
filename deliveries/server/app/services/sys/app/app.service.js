const { SysService } = require('../service');
const errors = require('@zerosjs/errors');

module.exports = function (app) {
  new AppService({}, app).register('app', {});
};

class AppService extends SysService {
  async create (data, params) {
    let { user } = Object.assign({ user: {} }, params);

    const dataService = zeros.service('data/apps');
    
    let modelData = _.pick(data, [ 'code', 'name', 'desc' ]);
    modelData = Object.assign({ uid: user.id }, modelData);

    let appModel = await dataService.create(modelData);

    if (data.tmpLogoUrl) {
      appModel = await this.updateLogo(appModel, {
        tmpUrl: data.tmpLogoUrl
      }, params);
    }

    return appModel;
  }

  async patch (id, data, params) {
    if (!id) {
      throw new errors.InnerError('请提供应用id。');
    }

    const dataService = zeros.service('data/apps');

    let appModel = await dataService.get(id);

    if (!appModel) {
      throw new errors.InnerError('应用不存在或已删除。');
    }

    if (appModel.frzn) {
      throw new errors.InnerError('应用已冻结。');
    }
    
    let modelData = _.pick(data, [ 'code', 'name', 'desc' ]);

    appModel = await dataService.patch(id, modelData);

    if (data.tmpLogoUrl) {
      appModel = await this.updateLogo(appModel, {
        tmpUrl: data.tmpLogoUrl
      }, params);
    }

    return appModel;
  }

  async updateLogo (appModel, logoData, params) {
    if (!logoData || !logoData.tmpUrl) {
      return appModel;
    }

    let rescService = zeros.service('sys/resc');
    let dataService = zeros.service('data/apps');

    // 删除以前的logo
    if (appModel.logo) {
      await rescService.removeMany('app/logo', {
        query: {
          appid: appModel.id,
          refid: appModel.id
        }
      });
    }

    let logoResc = await rescService.store('app/logo', {
      appid: appModel.id,
      name: `app_${appModel.id}_logo`,
      url: logoData.tmpUrl
    }, params);

    appModel = await dataService.patch(appModel.id, {
      logo: logoResc.path
    });

    return appModel;
  }
}
