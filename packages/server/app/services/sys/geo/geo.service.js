const { SysService } = require('../service');

module.exports = function (app) {
  new GeoService({ }, app).register('geo', {
  });
};

class GeoService extends SysService {
  _setup () {
  }
}
