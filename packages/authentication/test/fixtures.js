const { NotAuthenticated } = require('@zerosjs/errors');

const { AuthenticationBaseStrategy } = require('../lib/strategy');

class Strategy1 extends AuthenticationBaseStrategy {
  async authenticate (authentication) {
    if (authentication.username === 'David' || authentication.both) {
      return Strategy1.result;
    }

    throw new NotAuthenticated('Invalid Dave');
  }

  async parse (req) {
    if (req.isDave) {
      return Strategy1.result;
    }

    return null;
  }
}

Strategy1.result = {
  user: {
    id: 123,
    name: 'Dave'
  },
  authenticated: true
};

exports.Strategy1 = Strategy1

class Strategy2 extends AuthenticationBaseStrategy {
  authenticate (authentication, params) {
    const isV2 = authentication.v2 === true && authentication.password === 'supersecret';

    if (isV2 || authentication.both) {
      return Promise.resolve(Object.assign({ params, authentication }, Strategy2.result));
    }

    return Promise.reject(new NotAuthenticated('Invalid v2 user'));
  }

  async parse (req) {
    if (req.isV2) {
      return Strategy2.result;
    }

    return null;
  }
}

Strategy2.result = {
  user: {
    name: 'V2',
    version: 2
  },
  authenticated: true
};

exports.Strategy2  = Strategy2
