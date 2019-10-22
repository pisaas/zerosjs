const { ApiService } = require('../service');

exports.ApiService = class ConsoleApiService extends ApiService {
  constructor (options) {
    options = Object.assign({
      accessUserTypes: [0], // 允许访问的用户类型
      basePath: 'api/console'
    }, options);

    super(options);
  }
};
