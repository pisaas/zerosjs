const { stripSlashes } = require('@zerosjs/commons');
const debug = require('debug')('@zerosjs/express/rest');
const { parseAuthentication } = require('../authentication');
const getHandler = require('./getHandler');

const HTTP_METHOD = Symbol('@zerosjs/express/rest/HTTP_METHOD');

function httpMethod (verb, uris) {
  return method => {
    Object.defineProperty(method, HTTP_METHOD, {
      enumerable: false,
      configurable: true,
      writable: false,
      value: (Array.isArray(uris) ? uris : [uris])
        .reduce(
          (result, uri) => ([...result, { verb, uri }]),
          method[HTTP_METHOD] || []
        )
    });

    return method;
  };
}

function getDefaultUri (path, methods, method) {
  return methods[method].indexOf('id') === -1
    ? `/${path}/${method}`
    : `/${path}/:__zerosId/${method}`;
}

function parseRoute (path, methods, method, route) {
  return {
    method,
    verb: route.verb,
    uri: route.uri ? `/${path}/${stripSlashes(route.uri)}` : getDefaultUri(path, methods, method)
  };
}

function getServiceRoutes (service, path, defaultRoutes) {
  const { methods } = service;

  return Object.keys(methods)
    .filter(method => (service[method] && service[method][HTTP_METHOD]))
    .reduce((result, method) => {
      const routes = service[method][HTTP_METHOD];

      if (Array.isArray(routes)) {
        return [
          ...result,
          ...routes.map(route => parseRoute(path, methods, method, route))
        ];
      }

      return [
        ...result,
        parseRoute(path, methods, method, routes)
      ];
    }, defaultRoutes);
}

function getDefaultRoutes (uri) {
  const idUri = `${uri}/:__zerosId`;

  return [
    { method: 'find', verb: 'GET', uri }, // find(params)
    { method: 'get', verb: 'GET', uri: idUri }, // get(id, params)
    { method: 'create', verb: 'POST', uri }, // create(data, params)
    { method: 'patch', verb: 'PATCH', uri: idUri }, // patch(id, data, params)
    { method: 'patch', verb: 'PATCH', uri }, // patch(null, data, params)
    { method: 'update', verb: 'PUT', uri: idUri }, // update(id, data, params)
    { method: 'update', verb: 'PUT', uri }, // update(null, data, params)
    { method: 'remove', verb: 'DELETE', uri: idUri }, // remove(id, data, params)
    { method: 'remove', verb: 'DELETE', uri } // remove(null, data, params)
  ];
}

function formatter (req, res, next) {
  if (res.data === undefined) {
    return next();
  }

  res.format({
    'application/json': function () {
      res.json(res.data);
    }
  });
}

function rest (handler = formatter) {
  return function () {
    const app = this;

    if (typeof app.route !== 'function') {
      throw new Error('@zerosjs/express/rest needs an Express compatible app. Zeros apps have to wrapped with zeros-express first.');
    }

    if (!app.version || app.version < '0.0.1') {
      throw new Error(`@zerosjs/express/rest requires an instance of a Zeros application version 0.x or later (got ${app.version})`);
    }

    app.rest = {
      find: getHandler('find'),
      get: getHandler('get'),
      create: getHandler('create'),
      update: getHandler('update'),
      patch: getHandler('patch'),
      remove: getHandler('remove')
    };

    app.use(function (req, res, next) {
      req.zeros = Object.assign({
        provider: 'rest',
        headers: req.headers
      }, req.zeros);
      next();
    });

    app.use(parseAuthentication());

    // Register the REST provider
    app.providers.push(function (service, path, options) {
      if (service && service.options) {
        if (service.options.public !== true) {
          return;
        }
      }

      const baseUri = `/${path}`;
      let { middleware: { before, after } } = options;

      if (typeof handler === 'function') {
        after = after.concat(handler);
      }

      debug(`Adding REST provider for service \`${path}\` at base route \`${baseUri}\``);

      const routes = getServiceRoutes(service, path, getDefaultRoutes(baseUri));

      for (const { method, verb, uri } of routes) {
        app.route(uri)[verb.toLowerCase()](
          ...before,
          getHandler(method)(service, routes),
          ...after
        );
      }
    });
  };
}

rest.formatter = formatter;
rest.httpMethod = httpMethod;
rest.HTTP_METHOD = HTTP_METHOD;

module.exports = rest;
