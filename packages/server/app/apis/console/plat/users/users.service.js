const { ApiService } = require('../../service');

module.exports = function (app) {
  new Users().register(app, 'users', {
    adapterService: {
      path: 'data/usrs',
      methods: 'all'
    }
  });
};

class Users extends ApiService {
}
