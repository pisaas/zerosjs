exports.SysService = class SysService {
  constructor (options, app) {
    this.options = Object.assign({
      basePath: 'sys'
    }, options);

    this.app = app;
  }

  async get () {
    return;
  }

  register (path, options) {
    let opts = Object.assign({
      basePath: this.options.basePath
    }, options);

    return zeros.$service.register(this.app, path, this, opts);
  }
};
