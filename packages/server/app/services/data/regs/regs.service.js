const { EntityService } = require('../service');
const createModel = require('../../../models/reg.model');

module.exports = function (app) {
  const Model = createModel(app);

  new Regs({ Model }, app).register('regs');
};

class Regs extends EntityService {
}
