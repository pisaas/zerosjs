const { SysService } = require('../service');

module.exports = function (app) {
  new AppService({}, app).register('app', {});
};

class AppService extends SysService {
  async updateLogo (app, logo) {
    if (!logo || !logo.key) {
      return app;
    }

    let rescService = zeros.service('sys/resc');
    let dataService = zeros.service('data/apps');

    let logoData = await rescService.store('appLogo', {
      tmpKey: logo.key,
      appId: app.id
    });

    if (app.logo) {
      await rescService.remove('appLogo', { key: app.logo });
    }

    app = await dataService.patch(app.id, {
      logo: logoData.key
    });

    return app;
  }
}
