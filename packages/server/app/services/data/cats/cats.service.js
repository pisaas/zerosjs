const { EntityService } = require('../service');

module.exports = function (app) {
  new Cats('cat', app).register('cats', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'name', 'desc' ]
  });
};

class Cats extends EntityService {
}
