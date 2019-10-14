const { EntityService } = require('../service');
const createModel = require('../../../models/apps.model');

module.exports = function (app) {
  const Model = createModel(app);

  new Apps({ Model }, app).register('apps', {
    fuzzySearchFields: [ 'code', 'name' ]
  });
};

class Apps extends EntityService {
}
