const { EntityService } = require('../service');

module.exports = function (app) {
  new Rescs({
    modelName: 'resc',
    multi: true,
    paginate: {
      default: 20,
      max: 100
    }
  }, app).register('rescs', {
    autoOwner: true,
    fuzzySearchFields: [ 'name', 'uname', 'desc' ]
  });
};

class Rescs extends EntityService {
}
