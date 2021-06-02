const NodeEnvironment = require('jest-environment-node');

class ZerosEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();

    if (global.zeros) {
      this.global.zeros = global.zeros;
      this.global.zerosServer = global.zerosServer;
    }
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = ZerosEnvironment;
