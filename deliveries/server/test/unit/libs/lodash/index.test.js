const _ = require('lodash');

describe('\'lodash\' array utils', () => {
  it('concat', async () => {
    let results = _.concat([], undefined, [null]);

    console.log('result -------->', results);
  });
});
