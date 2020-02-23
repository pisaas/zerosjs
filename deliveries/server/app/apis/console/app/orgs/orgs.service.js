const { ApiService } = require('../../service');

module.exports = function () {
  new Orgs().register('orgs', {
    adapterService: {
      path: 'data/orgs',
      methods: 'all'
    }
  });
};

class Orgs extends ApiService {
}
