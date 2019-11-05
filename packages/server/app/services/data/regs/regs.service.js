const { EntityService } = require('../service');

module.exports = function (app) {
  new Regs('reg', app).register('regs');
};

class Regs extends EntityService {
}
