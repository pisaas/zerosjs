describe('\'lib\' security password', () => {
  it('hash a password', async () => {
    const pwdService = zeros.service('core/security/password');

    let hash1 = await pwdService.hash('123');
    let hash2 = await pwdService.hash('123');

    expect(hash1).toHaveLength(60);
    expect(hash1).not.toBe(hash2);

    let result = pwdService.compare(hash1, hash2);

    expect(result).toBeTruthy();
  });
});
