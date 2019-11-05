const { Service } = require('@zerosjs/adapter-mongoose');
const { fuzzySearch, preEntityCreate } = require('./hooks');

exports.EntityService = class EntityService extends Service {
  constructor (options, app) {
    const paginate = app.get('paginate');

    // console.log('app.plugins.orm.models -------->', app.plugins.orm.models);

    if (typeof options === 'string') {
      let modelName = options;

      options = {
        Model: app.plugins.orm.models[modelName]
      };
    }

    options = Object.assign({
      id: 'id',
      basePath: 'data',
      lean: false,
      paginate
    }, options);

    super(options, app);

    this.app = app;
  }

  register (path, options) {
    let { basePath } = this.options;

    let opts = Object.assign({
      basePath,
      hooks: {}
    }, options);

    // 添加自动生成Id Hook
    opts.hooks =zeros.$service.prependHook(opts.hooks, 'before.create', preEntityCreate(opts));

    // 添加模糊删除Hook
    let { fuzzySearchFields } = opts;
    if (fuzzySearchFields && fuzzySearchFields.length) {
      opts.hooks =zeros.$service.prependHook(opts.hooks, 'before.find', fuzzySearch({ fields: fuzzySearchFields }));
    }

    return zeros.$service.register(this.app, path, this, opts);
  }
};
