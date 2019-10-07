const { service } = require('../lib/common');

exports.ApiService = class ApiService {
  constructor (options) {
    this.app = null;

    Object.assign(this, {
      basePath: 'api'
    }, options);
  }

  _setup (app) {
    if (!this.app) {
      this.app = app;
    }
  }

  register (app, path, options) {
    this.app = app;

    let opts = Object.assign({
      basePath: this.basePath
    }, options);

    let protoService = service.register(app, path, this, opts);
    return protoService;
  }
};
