const path = require('path');
const { get, set } = require('lodash');
const includeAll = require('include-all');
const { stripSlashes } = require('@feathersjs/commons');

exports.configureDir = (app, dirname, options) => {
  dirname = dirname || path.join(__dirname, '.');

  options = Object.assign({
    dirname :  dirname,
    filter  :  /(.+service)\.js$/,
    flatten : true
  }, options);

  const modules = includeAll(options);

  for (let key in modules) {
    app.configure(modules[key]);
  }
};

// 注册服务通用方法
exports.register = (app, path, service, options) => {
  let opts = Object.assign({}, options);

  let { basePath, hooks } = opts;
  let servicePath = stripSlashes(path);

  if (basePath) {
    servicePath = `${basePath}/${servicePath}`;
  }

  app.use(servicePath, service);

  const protoService = app.service(servicePath);

  if (hooks) {
    protoService.hooks(hooks);
  }

  return protoService;
};

exports.prependHook = (hooks, path, hook) => {
  if (!path || !hook) {
    return hooks;
  }

  hooks = hooks || {};

  let targetHooks = get(hooks, path, []);
  if (!targetHooks) {
    targetHooks = set(hooks, path, []);
  }

  targetHooks.unshift(hook);
  set(hooks, path, targetHooks);

  return hooks;
};

exports.appendHook = (hooks, path, hook) => {
  if (!path || !hook) {
    return hooks;
  }

  hooks = hooks || {};

  let targetHooks = get(hooks, path, []);
  if (!targetHooks) {
    targetHooks = set(hooks, path, []);
  }

  targetHooks.push(hook);
  set(hooks, path, targetHooks);

  return hooks;
};
