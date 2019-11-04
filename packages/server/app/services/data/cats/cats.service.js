const { EntityService } = require('../service');
const createModel = require('../../../models/cat.model');

module.exports = function (app) {
  const Model = createModel(app);

  new Cats({ Model }, app).register('cats', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'name', 'desc' ]
  });
};

class Cats extends EntityService {
}
