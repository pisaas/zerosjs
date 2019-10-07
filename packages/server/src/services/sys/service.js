const { Service } = require('feathers-mongoose');
const { service } = require('../../lib/common');
const { genId } = require('./hooks');

exports.EntityService = class EntityService extends Service {
  constructor (options, app) {
    const paginate = app.get('paginate');

    options = Object.assign({
      id: 'id',
      basePath: 'sys',
      autoId: true, // 自动生成id
      disabledRest: true,
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

    return service.register(this.app, path, this, opts);
  }
};
