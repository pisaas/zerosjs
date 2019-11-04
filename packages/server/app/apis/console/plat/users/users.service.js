const { ApiService } = require('../../service');

module.exports = function (app) {
  new Users().register(app, 'users', {
    adapterService: {
      path: 'data/users',
      methods: 'all'
    }
  });
};

class Users extends ApiService {
}
