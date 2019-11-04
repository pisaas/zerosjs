const Debug = require('debug');
const path = require('path');
const config = require('config');

const debug = Debug('@zerosjs/server/configuration');
const separator = path.sep;

const exposeGlobals = require('./exposeGlobals');

module.exports = function init () {
  return (app) => {
    const convert = (current) => {
      const result = Array.isArray(current) ? [] : {};

      Object.keys(current).forEach(name => {
        let value = current[name];

        if (typeof value === 'object' && value !== null) {
          value = convert(value);
        }

        if (typeof value === 'string') {
          if (value.indexOf('\\') === 0) {
            value = value.replace('\\', '');
          } else {
            if (process.env[value]) {
              value = process.env[value];
            }

            if (value.indexOf('.') === 0 || value.indexOf('..') === 0) {
              // Make relative paths absolute
              value = path.resolve(
                path.join(config.util.getEnv('NODE_CONFIG_DIR')),
                value.replace(/\//g, separator)
              );
            }
          }
        }

        result[name] = value;
      });

      return result;
    };

    const env = config.util.getEnv('NODE_ENV');
    const conf = convert(config);

    const hostId = config.util.getEnv('HOST_ID');
    const instanceId = config.util.getEnv('NODE_APP_INSTANCE');

    conf.env = Object.assign({
      hostId,
      instanceId
    }, conf.env);

    if (!app) {
      return conf;
    }

    debug(`Initializing configuration for ${env} environment`);

    Object.keys(conf).forEach(name => {
      const value = conf[name];
      debug(`Setting ${name} configuration value to`, value);
      app.set(name, value);
    });

    exposeGlobals(app);

    return conf;
  };
};
