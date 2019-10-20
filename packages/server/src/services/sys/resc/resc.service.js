const { SysService } = require('../service');

module.exports = function (app) {
  new RescService({ }, app).register('resc', {
  });
};

class RescService extends SysService {
}
