const { EntityService } = require('../service');

const createModel = require('../../../models/orgs.model');

module.exports = function (app) {
  const Model = createModel(app);

  new Orgs({ Model }, app).register('orgs', {
    fuzzySearchFields: [ 'code', 'name' ]
  });
};

class Orgs extends EntityService {
}