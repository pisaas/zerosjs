const { ApiService } = require('../service');

exports.ApiService = class AdminApiService extends ApiService {
  constructor () {
    super({
      accessUserTypes: [0, 10], // 允许访问的用户类型
      basePath: 'api/admin'
    });
  }
};
