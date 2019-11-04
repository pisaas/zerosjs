const { EntityService } = require('../service');

const createModel = require('../../../models/org.model');

module.exports = function (app) {
  const Model = createModel(app);

  new Orgs({ Model }, app).register('orgs', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'name' ]
  });
};

class Orgs extends EntityService {
}
