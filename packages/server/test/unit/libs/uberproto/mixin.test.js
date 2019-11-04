const Proto = require('uberproto');
const CaptainsLog = require('captains-log');
const zeros = require('@zerosjs/zeros');

describe('\'zerosjs\' zeros mixin', () => {
  it('execute a mixin', async () => {
    var exApp = Proto.mixin({
      log: CaptainsLog()
    }, zeros());

    exApp.log('test ---------> log');
  });
});
