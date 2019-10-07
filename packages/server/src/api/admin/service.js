const { ApiService } = require('../service');

exports.ApiService = class AdminApiService extends ApiService {
  constructor () {
    super({
      basePath: 'api/admin'
    });
  }
};
