const { EntityService } = require('../service');

module.exports = function (app) {
  new Cats({
    modelName: 'cat',
    paginate: {
      default: 20,
      max: 1000
    }
  }, app).register('cats', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'name', 'desc' ]
  });
};

class Cats extends EntityService {
}
