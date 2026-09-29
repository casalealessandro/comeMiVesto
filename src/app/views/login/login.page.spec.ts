import { getSafeReturnUrl, LoginPage } from './login.page';

describe('LoginPage returnUrl validation', () => {
  it('preserves an internal protected destination', () => {
    expect(getSafeReturnUrl('/tabs/detail-outfit/abc')).toBe('/tabs/detail-outfit/abc');
  });

  for (const unsafe of ['https://evil.example', '//evil.example', '/register', 'tabs/myoutfit', '/tabs/../login']) {
    it(`rejects unsafe returnUrl ${unsafe}`, () => {
      expect(getSafeReturnUrl(unsafe)).toBe('/tabs/myoutfit');
    });
  }
});

describe('LoginPage intro routing', () => {
  let router: { navigate: jasmine.Spy };
  let route: { snapshot: { queryParamMap: { get: jasmine.Spy } } };

  beforeEach(() => {
    localStorage.removeItem('hasSeenIntro');
    router = { navigate: jasmine.createSpy().and.resolveTo(true) };
    route = {
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy().and.returnValue(null),
        },
      },
    };
  });

  afterEach(() => {
    localStorage.removeItem('hasSeenIntro');
  });

  function createPage(): LoginPage {
    return new LoginPage(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      router as any,
      route as any,
      { log: jasmine.createSpy('log'), recordError: jasmine.createSpy('recordError') } as any,
    );
  }

  it('keeps the login page when the intro flag is already persisted', () => {
    localStorage.setItem('hasSeenIntro', 'true');

    createPage().ngOnInit();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to intro when the intro flag is missing', () => {
    createPage().ngOnInit();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/intro'], {
      queryParams: undefined,
      replaceUrl: true,
    });
  });
});
