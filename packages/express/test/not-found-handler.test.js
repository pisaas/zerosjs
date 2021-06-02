const errors = require('@zerosjs/errors');

const handler = require('../lib/not-found-handler');

describe('not-found-handler', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib/not-found-handler')).toBe('function');
  });

  it('is import compatible', () => {
    expect(typeof handler).toBe('function');
  });

  it('returns NotFound error', done => {
    handler()({
      url: 'some/where',
      headers: {}
    }, {}, function (error) {
      expect(error instanceof errors.NotFound).toBe(true);
      expect(error.message).toBe('Page not found');
      expect(error.data).toEqual({
        url: 'some/where'
      });
      done();
    });
  });

  it('returns NotFound error with URL when verbose', done => {
    handler({ verbose: true })({
      url: 'some/where',
      headers: {}
    }, {}, function (error) {
      expect(error instanceof errors.NotFound).toBe(true);
      expect(error.message).toBe('Page not found: some/where');
      expect(error.data).toEqual({
        url: 'some/where'
      });
      done();
    });
  });
});
