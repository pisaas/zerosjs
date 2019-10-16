const { service } = require('../lib/common');
const debug = require('debug')('@zero/server/api');

exports.ApiService = class ApiService {
  constructor (options) {
    this.app = null;

    Object.assign(this, {
      basePath: 'api'
    }, options);
  }

  get adapterService () {
    if (!this.adapterServicPath) {
      return null;
    }
    return this.app.service(this.adapterServicPath);
  }

  _setup (app) {
    if (!this.app) {
      this.app = app;
    }
  }

  register (app, path, options) {
    debug(`register api service "${path}"`, app, options);
    
    this.app = app;

    let opts = Object.assign({
      basePath: this.basePath
    }, options);

    if (opts.adapterService) {
      this._registerAdapterService(app, opts.adapterService);
    }

    let protoService = service.register(app, path, this, opts);

    return protoService;
  }

  /**
   * 注册代理服务
   * @param {Application} app 
   * @param {adapterServiceOptions} options 
   */
  _registerAdapterService (app, options) {
    let { path, methods } = options;
    this.adapterServicPath = path;

    const AdapterMethods = ['find', 'get', 'create', 'update', 'patch', 'remove'];

    if (methods === 'all') {
      methods = AdapterMethods;
    } else {
      methods = methods || [];
    }

    let thiz = this;
    let aptService = this.adapterService;

    methods.forEach((m) => {
      if (!thiz[m] && aptService[m]) {
        thiz[m] = aptService[m].bind(aptService);
      }
    });
  }
};
