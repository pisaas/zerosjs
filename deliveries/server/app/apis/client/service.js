const { ApiService } = require('../service');

exports.ApiService = class ContentApiService extends ApiService {
  constructor () {
    super({
      accessUserTypes: [0, 10, 20], // 允许访问的用户类型
    });
  }
};
