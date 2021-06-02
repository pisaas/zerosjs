const { ApiService } = require('../../service');

module.exports = function () {
  new Users().register('users', {
    adapterService: {
      path: 'data/usrs',
      methods: 'all'
    }
  });
};

class Users extends ApiService {
}
