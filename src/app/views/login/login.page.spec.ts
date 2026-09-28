import { getSafeReturnUrl } from './login.page';

describe('LoginPage returnUrl validation', () => {
  it('preserves an internal protected destination', () => {
    expect(getSafeReturnUrl('/tabs/detail-outfit/abc')).toBe('/tabs/detail-outfit/abc');
  });

  it('preserves the public account deletion destination', () => {
    expect(getSafeReturnUrl('/delete-account')).toBe('/delete-account');
  });

  for (const unsafe of ['https://evil.example', '//evil.example', '/register', 'tabs/myoutfit', '/tabs/../login']) {
    it(`rejects unsafe returnUrl ${unsafe}`, () => {
      expect(getSafeReturnUrl(unsafe)).toBe('/tabs/myoutfit');
    });
  }
});
