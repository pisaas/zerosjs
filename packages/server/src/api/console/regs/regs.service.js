const { ApiService } = require('../service');

module.exports = function (app) {
  new Regs().register(app, 'regs', {
    adapterService: {
      path: 'sys/regs',
      methods: 'all'
    }
  });
};

class Regs extends ApiService {
}
