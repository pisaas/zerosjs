const { _ } = require('../lib');

describe('module', () => {
  it('is commonjs compatible', () => {
    const commons = require('../lib');

    expect(typeof commons).toBe('object');
    expect(typeof commons.stripSlashes).toBe('function');
    expect(typeof commons.hooks).toBe('object');
    expect(typeof commons._).toBe('object');
  });

  it('exposes lodash methods under _', () => {
    expect(typeof _.each).toBe('function');
    expect(typeof _.some).toBe('function');
    expect(typeof _.every).toBe('function');
    expect(typeof _.keys).toBe('function');
    expect(typeof _.values).toBe('function');
    expect(typeof _.isMatch).toBe('function');
    expect(typeof _.isEmpty).toBe('function');
    expect(typeof _.isObject).toBe('function');
    expect(typeof _.extend).toBe('function');
    expect(typeof _.omit).toBe('function');
    expect(typeof _.pick).toBe('function');
    expect(typeof _.merge).toBe('function');
  });
});
