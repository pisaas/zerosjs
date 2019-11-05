const debug = require('debug')('@zerosjs/server/api');

exports.ApiService = class ApiService {
  constructor (options) {
    this.options = Object.assign({
      public: true,
      basePath: 'api'
    }, options);
  }

  get adapterService () {
    if (!this.options.adapterServicPath) {
      return null;
    }
    return zeros.service(this.options.adapterServicPath);
  }
  
  get basePath () {
    return this.options.basePath;
  }

  _setup () {
  }

  register (app, path, options) {
    debug(`register api service "${path}"`, app, options);

    let opts = Object.assign({
      basePath: this.basePath,
      authenticate: {
        strategies: [ 'jwt' ]
      },
      hooks: {}
    }, options);

    if (opts.adapterService) {
      this._registerAdapterService(app, opts.adapterService);
    }

    let authOptions = opts.authenticate;
    if (authOptions) {
      // TODO: 
      // let authenticateHook = zeros.plugins.authentication.hooks;
      // // let hookPaths
      // opts.hooks = zeros.$service.prependHook(opts.hooks, 'before.all', authenticateHook(authOptions));
    }

    let protoService = zeros.$service.register(app, path, this, opts);

    return protoService;
  }

  /**
   * 注册代理服务
   * @param {Application} app 
   * @param {adapterServiceOptions} options 
   */
  _registerAdapterService (app, options) {
    let { path, methods } = options;
    this.options.adapterServicPath = path;

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
