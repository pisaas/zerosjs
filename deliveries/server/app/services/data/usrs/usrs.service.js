const { EntityService } = require('../service');
const hooks = require('./usrs.hooks')();

module.exports = function (app) {
  new Usrs('usr', app).register('usrs', {
    autoOwner: true,
    fuzzySearchFields: [ 'id', 'uname', 'mobile', 'email', 'weixin', 'nickname', 'realname' ],
    hooks
  });
};

class Usrs extends EntityService {
}