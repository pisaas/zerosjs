const { ApiService } = require('../service');

exports.ApiService = class ConsoleApiService extends ApiService {
  constructor (options) {
    options = Object.assign({
      basePath: 'api/console'
    }, options);

    super(options);
  }
};
