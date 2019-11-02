const express = require('express');
const Proto = require('uberproto');
const debug = require('debug')('@zerojs/express');

const errorHandler = require('./error-handler');
const authentication = require('./authentication');
const notFound = require('./not-found-handler');
const rest = require('./rest');

function zeroExpress (zeroApp, expressApp = express()) {
  if (!zeroApp) {
    return expressApp;
  }

  if (typeof zeroApp.setup !== 'function') {
    throw new Error('@zerojs/express requires a valid Feathers application instance');
  }

  if (!zeroApp.version || zeroApp.version < '3.0.0') {
    throw new Error(`@zerojs/express requires an instance of a Feathers application version 3.x or later (got ${zeroApp.version || 'unknown'})`);
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
      // Since this is a serivce, call Feathers `.use`
      zeroApp.use.call(this, location, service, { middleware });

      return this;
    },

    listen () {
      const server = this._super.apply(this, arguments);

      this.setup(server);
      debug('Feathers application listening');

      return server;
    }
  };

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.getOwnPropertyNames(zeroApp).forEach(prop => {
    const feathersProp = Object.getOwnPropertyDescriptor(zeroApp, prop);
    const expressProp = Object.getOwnPropertyDescriptor(expressApp, prop);

    if (expressProp === undefined && feathersProp !== undefined) {
      Object.defineProperty(expressApp, prop, feathersProp);
    }
  });

  return Proto.mixin(mixin, expressApp);
}

module.exports = zeroExpress;

Object.assign(module.exports, express, authentication, {
  default: zeroExpress,
  original: express,
  rest,
  notFound,
  errorHandler
});
