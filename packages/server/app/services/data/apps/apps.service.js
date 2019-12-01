const { EntityService } = require('../service');

module.exports = function (app) {
  new Apps('app', app).register('apps', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'name' ]
  });
};

class Apps extends EntityService {
}
