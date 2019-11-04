const { hashPassword } = require('../../../authentication/strategies/local').hooks;

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [ hashPassword('password') ],
    update: [ hashPassword('password') ],
    patch: [ hashPassword('password') ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
