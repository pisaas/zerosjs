describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = zeros.service('data/usrs');
    
    expect(service).toBeTruthy();
  });
});
