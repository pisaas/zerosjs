const assert = require('assert');
const zero = require('@zerojs/zero');
const { channels, keys } = require('../../lib/channels');

describe('zero-channels', () => {
  it('has app.channel', () => {
    const app = zero().configure(channels());

    assert.strictEqual(typeof app.channel, 'function');
    assert.strictEqual(typeof app[keys.CHANNELS], 'object');
    assert.strictEqual(app.channels.length, 0);
  });

  it('throws an error when called with nothing', () => {
    const app = zero().configure(channels());

    try {
      app.channel();
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.strictEqual(e.message, 'app.channel needs at least one channel name');
    }
  });

  it('configuring twice does nothing', () => {
    zero()
      .configure(channels())
      .configure(channels());
  });

  it('does not add things to the service if `dispatch` exists', () => {
    const app = zero()
      .configure(channels())
      .use('/test', {
        setup () {},
        publish () {}
      });

    assert.ok(!app.service('test')[keys.PUBLISHERS]);
  });
});
