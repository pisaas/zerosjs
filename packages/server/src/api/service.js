const { authenticate } = require('@feathersjs/authentication');
const debug = require('debug')('@zero/server/api');

exports.ApiService = class ApiService {
  constructor (options) {
    Object.assign(this, {
      basePath: 'api'
    }, options);
  }

  get adapterService () {
    if (!this.adapterServicPath) {
      return null;
    }
    return zero.service(this.adapterServicPath);
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
      // let hookPaths 
      opts.hooks = zero.$service.prependHook(opts.hooks, 'before.all', authenticate(authOptions));
    }

    let protoService = zero.$service.register(app, path, this, opts);

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
