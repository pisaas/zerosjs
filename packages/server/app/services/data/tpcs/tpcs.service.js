const { EntityService } = require('../service');

module.exports = function (app) {
  new Cats({
    modelName: 'tpc',
    paginate: {
      default: 20,
      max: 100
    }
  }, app).register('tpcs', {
    autoOwner: true,
    fuzzySearchFields: [ 'name', 'uname', 'desc', 'cont' ]
  });
};

class Cats extends EntityService {
}
