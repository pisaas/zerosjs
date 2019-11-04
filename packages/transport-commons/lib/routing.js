const Router = require('radix-router');
const { stripSlashes } = require('@zerosjs/commons');

const ROUTER = Symbol('@zerosjs/transport-commons/router');

const routing = () => (app) => {
  if (typeof app.lookup === 'function') {
    return;
  }

  const router = new Router();

  Object.assign(app, {
    [ROUTER]: router,
    lookup (path) {
      if (!path) {
        return null;
      }

      return this[ROUTER].lookup(stripSlashes('' + path) || '/');
    }
  });

  // Add a mixin that registers a service on the router
  app.mixins.push((service, path) => {
    // @ts-ignore
    app[ROUTER].insert({ path, service });
    // @ts-ignore
    app[ROUTER].insert({
      path: `${path}/:__id`,
      service
    });
  });
};

module.exports = {
  ROUTER,
  routing
}
