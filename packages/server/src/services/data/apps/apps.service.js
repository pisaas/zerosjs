const { EntityService } = require('../service');
const createModel = require('../../../models/app.model');

module.exports = function (app) {
  const Model = createModel(app);

  new Apps({ Model }, app).register('apps', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'name' ]
  });
};

class Apps extends EntityService {
  async updateLogo (app, logo) {
    if (!logo || !logo.key) {
      return app;
    }

    let rescService = zeros.service('sys/resc');

    let logoData = await rescService.store('appLogo', {
      tmpKey: logo.key,
      appId: app.id
    });

    if (app.logo) {
      await rescService.remove('appLogo', { key: app.logo });
    }

    app = await this.patch(app.id, {
      logo: logoData.key
    });

    return app;
  }
}
