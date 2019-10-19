const { Service } = require('feathers-mongoose');
const { service } = require('../../common');
const { genId, fuzzySearch } = require('./hooks');

exports.EntityService = class EntityService extends Service {
  constructor (options, app) {
    const paginate = app.get('paginate');

    options = Object.assign({
      id: 'id',
      basePath: 'data',
      autoId: true, // 自动生成id
      disabledRest: true,
      lean: false,
      paginate
    }, options);

    super(options, app);

    this.app = app;
  }

  register (path, options) {
    let { basePath, autoId, id } = this.options;

    let opts = Object.assign({
      basePath,
      hooks: {}
    }, options);

    // 添加自动生成Id Hook
    if (autoId !== false) {
      opts.hooks = service.prependHook(opts.hooks, 'before.create', genId(id));
    }

    let { fuzzySearchFields } = opts;

    if (fuzzySearchFields && fuzzySearchFields.length) {
      opts.hooks = service.prependHook(opts.hooks, 'before.find', fuzzySearch({ fields: fuzzySearchFields }));
    }

    return service.register(this.app, path, this, opts);
  }
};
