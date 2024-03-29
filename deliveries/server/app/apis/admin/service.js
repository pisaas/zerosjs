const { ApiService } = require('../service');

const { appLoad } = require('./hooks');

exports.ApiService = class AdminApiService extends ApiService {
  constructor () {
    super({
      accessUserTypes: [0, 10], // 允许访问的用户类型
      basePath: 'api/admin'
    });
  }

  register (path, options) {
    let opts = Object.assign({ hooks: {} }, options);

    opts.hooks = zeros.$service.prependHook(opts.hooks, 'before.all', appLoad());

    let protoService = super.register(path, opts);

    return protoService;
  }
};
