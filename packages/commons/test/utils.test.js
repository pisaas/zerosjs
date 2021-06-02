/* tslint:disable:no-unused-expression */

const {
  _,
  stripSlashes,
  isPromise,
  makeUrl,
  createSymbol
} = require('../lib');

describe('@zerosjs/commons utils', () => {
  it('stripSlashes', () => {
    expect(stripSlashes('some/thing')).toBe('some/thing');
    expect(stripSlashes('/some/thing')).toBe('some/thing');
    expect(stripSlashes('some/thing/')).toBe('some/thing');
    expect(stripSlashes('/some/thing/')).toBe('some/thing');
    expect(stripSlashes('//some/thing/')).toBe('some/thing');
    expect(stripSlashes('//some//thing////')).toBe('some//thing');
  });

  it('isPromise', () => {
    expect(isPromise(Promise.resolve())).toBe(true);
    expect(isPromise({
      then () {}
    })).toBe(true);
    expect(isPromise(null)).toBe(false);
  });

  it('createSymbol', () => {
    expect(typeof createSymbol('a test')).toBe('symbol');
  });

  describe('_', () => {
    it('isObject', () => {
      expect(_.isObject({})).toBe(true);
      expect(_.isObject([])).toBe(false);
      expect(_.isObject(null)).toBe(false);
    });

    it('isObjectOrArray', () => {
      expect(_.isObjectOrArray({})).toBe(true);
      expect(_.isObjectOrArray([])).toBe(true);
      expect(_.isObjectOrArray(null)).toBe(false);
    });

    it('each', () => {
      _.each({ hi: 'there' }, (value, key) => {
        expect(key).toBe('hi');
        expect(value).toBe('there');
      });

      _.each([ 'hi' ], (value, key) => {
        expect(key).toBe(0);
        expect(value).toBe('hi');
      });

      _.each('moo', () => expect(false)
        .toBe(true, 'Should never get here')
      );
    });

    it('some', () => {
      expect(_.some([ 'a', 'b' ], current => current === 'a')).toBeTruthy();
      expect(!_.some([ 'a', 'b' ], current => current === 'c')).toBeTruthy();
    });

    it('every', () => {
      expect(_.every([ 'a', 'a' ], current => current === 'a')).toBeTruthy();
      expect(!_.every([ 'a', 'b' ], current => current === 'a')).toBeTruthy();
    });

    it('keys', () => {
      const data = { hi: 'there', name: 'David' };
      expect(_.keys(data)).toEqual([ 'hi', 'name' ]);
    });

    it('values', () => {
      const data = { hi: 'there', name: 'David' };
      expect(_.values(data)).toEqual([ 'there', 'David' ]);
    });

    it('isMatch', () => {
      expect(_.isMatch({
        test: 'me', hi: 'you', more: true
      }, {
        test: 'me', hi: 'you'
      })).toBeTruthy();

      expect(!_.isMatch({
        test: 'me', hi: 'you', more: true
      }, {
        test: 'me', hi: 'there'
      })).toBeTruthy();
    });

    it('isEmpty', () => {
      expect(_.isEmpty({})).toBeTruthy();
      expect(!_.isEmpty({ name: 'David' })).toBeTruthy();
    });

    it('extend', () => {
      expect(_.extend({ hi: 'there' }, { name: 'david' })).toEqual({
        hi: 'there',
        name: 'david'
      });
    });

    it('omit', () => {
      expect(_.omit({
        name: 'David',
        first: 1,
        second: 2
      }, 'first', 'second')).toEqual({
        name: 'David'
      });
    });

    it('pick', () => {
      expect(_.pick({
        name: 'David',
        first: 1,
        second: 2
      }, 'first', 'second')).toEqual({
        first: 1,
        second: 2
      });

      expect(_.pick({
        name: 'David',
        first: 1
      }, 'first', 'second')).toEqual({
        first: 1
      });
    });

    it('merge', () => {
      expect(_.merge({ hi: 'there' }, { name: 'david' })).toEqual({
        hi: 'there',
        name: 'david'
      });

      expect(_.merge({}, {
        name: 'david',
        nested: { obj: true }
      })).toEqual({
        name: 'david',
        nested: { obj: true }
      });

      expect(_.merge({ name: 'david' }, {})).toEqual({
        name: 'david'
      });

      expect(_.merge({
        hi: 'there',
        my: {
          name: { is: 'david' },
          number: { is: 1 }
        }
      }, { my: { name: { is: 'eric' } } })).toEqual({
        hi: 'there',
        my: {
          number: { is: 1 },
          name: { is: 'eric' }
        }
      });

      expect(_.merge('hello', {})).toBe('hello');
    });
  });

  describe('makeUrl', function () {
    let mockApp;

    beforeEach(() => {
      mockApp = { env: 'development' };
      mockApp.get = (value) => {
        switch (value) {
          case 'port':
            return 3030;
          case 'host':
            return 'zerosjs.com';
          case 'env':
            return mockApp.env;
        }
      };
    });

    it('when in development mode returns the correct url', () => {
      const uri = makeUrl('test', mockApp);
      expect(uri).toBe('http://zerosjs.com:3030/test');
    });

    it('when in test mode returns the correct url', () => {
      mockApp.env = 'test';
      const uri = makeUrl('test', mockApp);
      expect(uri).toBe('http://zerosjs.com:3030/test');
    });

    it('when in production mode returns the correct url', () => {
      mockApp.env = 'production';
      const uri = makeUrl('test', mockApp);
      expect(uri).toBe('https://zerosjs.com/test');
    });

    it('when path is not provided returns a default url', () => {
      const uri = makeUrl(null, mockApp);
      expect(uri).toBe('http://zerosjs.com:3030/');
    });

    it('when app is not defined returns the correct url', () => {
      const uri = makeUrl('test');
      expect(uri).toBe('http://localhost:3030/test');
    });

    it('strips leading slashes on path', () => {
      const uri = makeUrl('/test');
      expect(uri).toBe('http://localhost:3030/test');
    });

    it('strips trailing slashes on path', () => {
      const uri = makeUrl('test/');
      expect(uri).toBe('http://localhost:3030/test');
    });

    it('works with query strings', () => {
      const uri = makeUrl('test?admin=true');
      expect(uri).toBe('http://localhost:3030/test?admin=true');
    });
  });
});
