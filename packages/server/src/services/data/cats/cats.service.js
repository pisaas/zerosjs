const { EntityService } = require('../service');
const createModel = require('../../../models/cats.model');

module.exports = function (app) {
  const Model = createModel(app);

  new Cats({ Model }, app).register('cats');
};

class Cats extends EntityService {
}
