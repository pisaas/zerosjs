const { EntityService } = require('../service');

module.exports = function (app) {
  new Regs('reg', app).register('regs', {
    autoOwner: true
  });
};

class Regs extends EntityService {
}
