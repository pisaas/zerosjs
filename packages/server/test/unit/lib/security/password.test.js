const security = require('../../../../src/lib/security');

describe('\'lib\' security password', () => {
  it('hash a password', async () => {
    let hash1 = await security.password.hash('123');
    let hash2 = await security.password.hash('123');

    expect(hash1).toHaveLength(60);
    expect(hash1).not.toBe(hash2);

    let result = security.password.compare(hash1, hash2);

    expect(result).toBeTruthy();
  });
});
