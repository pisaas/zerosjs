const { Service } = require('feathers-mongoose');
const { fuzzySearch, preEntityCreate } = require('./hooks');

exports.EntityService = class EntityService extends Service {
  constructor (options, app) {
    const paginate = app.get('paginate');

    options = Object.assign({
      id: 'id',
      basePath: 'data',
      disabledRest: true,
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
    opts.hooks =zero.$service.prependHook(opts.hooks, 'before.create', preEntityCreate(opts));

    let { fuzzySearchFields } = opts;

    if (fuzzySearchFields && fuzzySearchFields.length) {
      opts.hooks =zero.$service.prependHook(opts.hooks, 'before.find', fuzzySearch({ fields: fuzzySearchFields }));
    }

    return zero.$service.register(this.app, path, this, opts);
  }
};
