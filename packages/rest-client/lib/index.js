const Axios = require('./axios');
const Base = require('./base');
const Fetch = require('./fetch');

const transports = {
  axios: Axios,
  fetch: Fetch
};

function restClient (base = '') {
  const result = { Base };

  Object.keys(transports).forEach(key => {
    const Service = transports[key];

    result[key] = function (connection, options = {}) {
      if (!connection) {
        throw new Error(`${key} has to be provided to zeros-rest`);
      }

      const defaultService = function (name) {
        return new Service({ base, name, connection, options });
      };

      const initialize = function (app) {
        if (typeof app.defaultService === 'function') {
          throw new Error('Only one default client provider can be configured');
        }

        app.rest = connection;
        app.defaultService = defaultService;
      };

      initialize.Service = Service;
      initialize.service = defaultService;

      return initialize;
    };
  });

  return result;
}

module.exports = restClient;
module.exports.default = restClient;
