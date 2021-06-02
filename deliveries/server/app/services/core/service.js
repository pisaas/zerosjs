exports.CoreService = class CoreService {
  constructor (options) {
    this.options = Object.assign({
      basePath: 'core'
    }, options);
  }

  async get () {
    return;
  }

  register (path, options) {
    let opts = Object.assign({
      basePath: this.options.basePath
    }, options);

    return zeros.$service.register(path, this, opts);
  }
};
