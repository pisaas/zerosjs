const { EntityService } = require('../service');

module.exports = function (app) {
  new Orgs('org', app).register('orgs', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'name' ]
  });
};

class Orgs extends EntityService {
}
