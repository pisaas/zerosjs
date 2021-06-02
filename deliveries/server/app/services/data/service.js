const { Service } = require('@zerosjs/adapter-mongoose');
const { fuzzySearch, preEntityCreate } = require('./hooks');

exports.EntityService = class EntityService extends Service {
  constructor (options, app) {
    const paginate = zeros.get('paginate');

    if (typeof options === 'string') {
      options = {
        modelName: options
      };
    }

    options = Object.assign({
      id: 'id',
      basePath: 'data',
      lean: false,
      paginate
    }, options);

    if (!options.Model && options.modelName) {
      options.Model = zeros.$datastore.model(options.modelName);
    }

    super(options, app);
  }

  register (path, options) {
    let { basePath } = this.options;

    let opts = Object.assign({
      basePath,
      hooks: {}
    }, options);

    // 添加自动生成Id Hook
    opts.hooks = zeros.$service.prependHook(opts.hooks, 'before.create', preEntityCreate(opts));

    // 添加模糊删除Hook
    let { fuzzySearchFields } = opts;
    if (fuzzySearchFields && fuzzySearchFields.length) {
      opts.hooks =zeros.$service.prependHook(opts.hooks, 'before.find', fuzzySearch({ fields: fuzzySearchFields }));
    }

    return zeros.$service.register(path, this, opts);
  }

  async findOne (query) {
    query = Object.assign({}, query, { $limit: 1 });

    let queryResults = await this.find({
      query,
      paginate: false
    });

    if (!queryResults.data || !queryResults.data.length) {
      return null;
    }

    return queryResults.data[0];
  }
};
