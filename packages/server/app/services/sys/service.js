exports.SysService = class SysService {
  constructor (options) {
    this.options = Object.assign({
      basePath: 'sys'
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
