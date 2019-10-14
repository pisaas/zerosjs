const { ApiService } = require('../service');

module.exports = function (app) {
  new Apps().register(app, 'apps', {
    adapterService: {
      path: 'sys/apps',
      methods: 'all'
    }
  });
};

class Apps extends ApiService {
}
