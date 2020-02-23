const { EntityService } = require('../service');

module.exports = function (app) {
  new Topics({
    modelName: 'tpc',
    multi: true,
    paginate: {
      default: 20,
      max: 100
    }
  }, app).register('tpcs', {
    autoOwner: true,
    fuzzySearchFields: [ 'name', 'uname', 'desc', 'cont' ]
  });
};

class Topics extends EntityService {
}
