const { createSymbol, _ } = require('./utils');

const { each, pick } = _;

const ACTIVATE_HOOKS = createSymbol('__zeroActivateHooks');

function createHookObject (method, data = {}) {
  const hook = {};

  Object.defineProperty(hook, 'toJSON', {
    value () {
      return pick(this, 'type', 'method', 'path',
        'params', 'id', 'data', 'result', 'error');
    }
  });

  return Object.assign(hook, data, {
    method,
    // A dynamic getter that returns the path of the service
    get path () {
      const { app, service } = data;

      if (!service || !app || !app.services) {
        return null;
      }

      return Object.keys(app.services)
        .find(path => app.services[path] === service);
    }
  });
}

// Fallback used by `makeArguments` which usually won't be used
function defaultMakeArguments (hook) {
  const result = [];

  if (typeof hook.id !== 'undefined') {
    result.push(hook.id);
  }

  if (hook.data) {
    result.push(hook.data);
  }

  result.push(hook.params || {});

  return result;
}

// Turns a hook object back into a list of arguments
// to call a service method with
function makeArguments (hook) {
  switch (hook.method) {
    case 'find':
      return [ hook.params ];
    case 'get':
    case 'remove':
      return [ hook.id, hook.params ];
    case 'update':
    case 'patch':
      return [ hook.id, hook.data, hook.params ];
    case 'create':
      return [ hook.data, hook.params ];
  }

  return defaultMakeArguments(hook);
}

// Converts different hook registration formats into the
// same internal format
function convertHookData (obj) {
  let hook = {};

  if (Array.isArray(obj)) {
    hook = { all: obj };
  } else if (typeof obj !== 'object') {
    hook = { all: [ obj ] };
  } else {
    each(obj, function (value, key) {
      hook[key] = !Array.isArray(value) ? [ value ] : value;
    });
  }

  return hook;
}

// Duck-checks a given object to be a hook object
// A valid hook object has `type` and `method`
function isHookObject (hookObject) {
  return typeof hookObject === 'object' &&
    typeof hookObject.method === 'string' &&
    typeof hookObject.type === 'string';
}

// Returns all service and application hooks combined
// for a given method and type `appLast` sets if the hooks
// from `app` should be added last (or first by default)
function getHooks (app, service, type, method, appLast = false) {
  const appHooks = app.__hooks[type][method] || [];
  const serviceHooks = service.__hooks[type][method] || [];

  if (appLast) {
    // Run hooks in the order of service -> app -> finally
    return serviceHooks.concat(appHooks);
  }

  return appHooks.concat(serviceHooks);
}

function processHooks (hooks, initialHookObject) {
  let hookObject = initialHookObject;

  const updateCurrentHook = (current) => {
    // Either use the returned hook object or the current
    // hook object from the chain if the hook returned undefined
    if (current) {
      if (!isHookObject(current)) {
        throw new Error(`${hookObject.type} hook for '${hookObject.method}' method returned invalid hook object`);
      }

      hookObject = current;
    }

    return hookObject;
  };
  // Go through all hooks and chain them into our promise
  const promise = hooks.reduce((current, fn) => {
    // @ts-ignore
    const hook = fn.bind(this);

    // Use the returned hook object or the old one
    return current.then((currentHook) => hook(currentHook)).then(updateCurrentHook);
  }, Promise.resolve(hookObject));

  return promise.then(() => hookObject).catch(error => {
    // Add the hook information to any errors
    error.hook = hookObject;
    throw error;
  });
}

// Add `.hooks` functionality to an object
function enableHooks (obj, methods, types) {
  if (typeof obj.hooks === 'function') {
    return obj;
  }

  const hookData = {};

  types.forEach(type => {
    // Initialize properties where hook functions are stored
    hookData[type] = {};
  });

  // Add non-enumerable `__hooks` property to the object
  Object.defineProperty(obj, '__hooks', {
    value: hookData
  });

  return Object.assign(obj, {
    hooks (allHooks) {
      each(allHooks, (current, type) => {
        // @ts-ignore
        if (!this.__hooks[type]) {
          throw new Error(`'${type}' is not a valid hook type`);
        }

        const hooks = convertHookData(current);

        each(hooks, (_value, method) => {
          if (method !== 'all' && methods.indexOf(method) === -1) {
            throw new Error(`'${method}' is not a valid hook method`);
          }
        });

        methods.forEach(method => {
          // @ts-ignore
          const myHooks = this.__hooks[type][method] || (this.__hooks[type][method] = []);

          if (hooks.all) {
            myHooks.push.apply(myHooks, hooks.all);
          }

          if (hooks[method]) {
            myHooks.push.apply(myHooks, hooks[method]);
          }
        });
      });

      return this;
    }
  });
}

module.exports = {
  ACTIVATE_HOOKS,
  createHookObject,
  defaultMakeArguments,
  makeArguments,
  convertHookData,
  isHookObject,
  getHooks,
  processHooks,
  enableHooks
}
