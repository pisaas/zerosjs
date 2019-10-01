const { Service } = require('feathers-mongoose');

exports.ServiceBase = class ServiceBase extends Service {
  constructor (options) {
    options = Object.assign({
      disabledRest: true
    }, options);

    super(options);
  }
};