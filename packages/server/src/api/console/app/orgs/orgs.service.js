const { ApiService } = require('../../service');

module.exports = function (app) {
  new Orgs().register(app, 'orgs', {
    adapterService: {
      path: 'data/orgs',
      methods: 'all'
    }
  });
};

class Orgs extends ApiService {
  async find (params) {
    console.log('find ------->', params.user);

    return await this.adapterService.find(params);
  }
}
