const { ApiService } = require('../service');

exports.ApiService = class ConsoleApiService extends ApiService {
  constructor () {
    super({
      basePath: 'api/console'
    });
  }
};
