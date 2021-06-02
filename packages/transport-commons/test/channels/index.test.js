const assert = require('assert');
const zeros = require('@zerosjs/zeros');
const { channels, keys } = require('../../lib/channels');

describe('zeros-channels', () => {
  it('has app.channel', () => {
    const app = zeros().configure(channels());

    assert.strictEqual(typeof app.channel, 'function');
    assert.strictEqual(typeof app[keys.CHANNELS], 'object');
    assert.strictEqual(app.channels.length, 0);
  });

  it('throws an error when called with nothing', () => {
    const app = zeros().configure(channels());

    try {
      app.channel();
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.strictEqual(e.message, 'app.channel needs at least one channel name');
    }
  });

  it('configuring twice does nothing', () => {
    zeros()
      .configure(channels())
      .configure(channels());
  });

  it('does not add things to the service if `dispatch` exists', () => {
    const app = zeros()
      .configure(channels())
      .use('/test', {
        setup () {},
        publish () {}
      });

    assert.ok(!app.service('test')[keys.PUBLISHERS]);
  });
});
