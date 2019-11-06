const { EntityService } = require('../service');
const hooks = require('./usrs.hooks')();

module.exports = function (app) {
  new Usrs('usr', app).register('usrs', {
    autoOwner: true,
    fuzzySearchFields: [ 'code', 'nickname' ],
    hooks
  });
};

class Usrs extends EntityService {
}