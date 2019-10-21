exports.OpenService = class OpenService {
  constructor (options, app) {
    this.options = Object.assign({
      basePath: 'open',
      disabledRest: true
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

    return zero.$service.register(this.app, path, this, opts);
  }
};
