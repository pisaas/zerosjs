const express = require('express');
const Proto = require('uberproto');
const debug = require('debug')('@zerosjs/express');

const errorHandler = require('./error-handler');
const authentication = require('./authentication');
const notFound = require('./not-found-handler');
const rest = require('./rest');

function zerosExpress (zerosApp, expressApp = express()) {
  if (!zerosApp) {
    return expressApp;
  }

  if (typeof zerosApp.setup !== 'function') {
    throw new Error('@zerosjs/express requires a valid Zeros application instance');
  }

  if (!zerosApp.version || zerosApp.version < '0.0.1') {
    throw new Error(`@zerosjs/express requires an instance of a Zeros application version 0.x or later (got ${zerosApp.version || 'unknown'})`);
  }

  // An Uberproto mixin that provides the extended functionality
  const mixin = {
    use (location) {
      let service;
      let middleware = Array.from(arguments)
        .slice(1)
        .reduce(function (middleware, arg) {
          if (typeof arg === 'function' || Array.isArray(arg)) {
            middleware[service ? 'after' : 'before'].push(arg);
          } else if (!service) {
            service = arg;
          } else {
            throw new Error('Invalid options passed to app.use');
          }
          return middleware;
        }, {
          before: [],
          after: []
        });

      const hasMethod = methods => methods.some(name =>
        (service && typeof service[name] === 'function')
      );

      if (hasMethod(['handle', 'set']) || !hasMethod(this.methods.concat('setup'))) {
        debug('Passing app.use call to Express app');
        return this._super.apply(this, arguments);
      }

      debug('Registering service with middleware', middleware);
      // Since this is a serivce, call Zeros `.use`
      zerosApp.use.call(this, location, service, { middleware });

      return this;
    },

    listen () {
      const server = this._super.apply(this, arguments);

      this.setup(server);
      debug('Zeros application listening');

      return server;
    }
  };

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.getOwnPropertyNames(zerosApp).forEach(prop => {
    const zerosProp = Object.getOwnPropertyDescriptor(zerosApp, prop);
    const expressProp = Object.getOwnPropertyDescriptor(expressApp, prop);

    if (expressProp === undefined && zerosProp !== undefined) {
      Object.defineProperty(expressApp, prop, zerosProp);
    }
  });

  return Proto.mixin(mixin, expressApp);
}

module.exports = zerosExpress;

Object.assign(module.exports, express, authentication, {
  default: zerosExpress,
  original: express,
  rest,
  notFound,
  errorHandler
});
