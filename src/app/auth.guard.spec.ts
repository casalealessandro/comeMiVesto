import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from './app-routing.module';
import { authGuard } from './auth.guard';
import { TermsAcceptanceService } from './service/terms-acceptance.service';
import { UserService } from './service/user.service';
import { FirebaseService } from './service/firebase.service';

describe('protected routing', () => {
  let auth: any;
  let users: any;
  let terms: any;
  let router: Router;

  beforeEach(() => {
    auth = { waitForAuthState: jasmine.createSpy().and.resolveTo(null) };
    users = {
      loadBootstrap: jasmine.createSpy().and.resolveTo({
        profile: { uid: 'user' },
        terms: { accepted: true, acceptedVersion: '1', currentVersion: '1' },
        preferences: null,
        preferencesConfigured: false
      }),
      isBootstrapReady: jasmine.createSpy().and.returnValue(false),
      gTermsStatus: jasmine.createSpy().and.returnValue(() => ({
        accepted: true, acceptedVersion: '1', currentVersion: '1'
      }))
    };
    terms = { allowAppAccess: jasmine.createSpy().and.resolveTo('accepted') };
    TestBed.configureTestingModule({ imports: [RouterTestingModule], providers: [
      { provide: FirebaseService, useValue: auth }, { provide: UserService, useValue: users },
      { provide: TermsAcceptanceService, useValue: terms }
    ] });
    router = TestBed.inject(Router);
  });

  async function run(url: string): Promise<boolean | UrlTree> {
    return TestBed.runInInjectionContext(() => authGuard({} as any, { url } as RouterStateSnapshot)) as Promise<boolean | UrlTree>;
  }

  it('redirects signed-out protected requests to login with returnUrl', async () => {
    const result = await run('/tabs/detail-outfit/abc') as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login?returnUrl=%2Ftabs%2Fdetail-outfit%2Fabc');
  });

  it('waits for persisted auth state before deciding the route', async () => {
    let restoreSession!: (user: any) => void;
    auth.waitForAuthState.and.returnValue(new Promise(resolve => restoreSession = resolve));

    const decision = run('/tabs/myoutfit');
    expect(users.loadBootstrap).not.toHaveBeenCalled();
    restoreSession({ uid: 'user', getIdToken: () => Promise.resolve('token') });

    expect(await decision).toBeTrue();
    expect(users.loadBootstrap).toHaveBeenCalled();
  });

  it('does not reload the profile when the current user is already loaded', async () => {
    auth.waitForAuthState.and.resolveTo({ uid: 'user', getIdToken: () => Promise.resolve('token') });
    users.isBootstrapReady.and.returnValue(true);

    expect(await run('/tabs/my-profile')).toBeTrue();
    expect(users.loadBootstrap).not.toHaveBeenCalled();
  });

  it('allows the original protected route when signed in with current Terms', async () => {
    auth.waitForAuthState.and.resolveTo({ uid: 'user', getIdToken: () => Promise.resolve('token') });
    expect(await run('/tabs/detail-outfit/abc')).toBeTrue();
    expect(terms.allowAppAccess).toHaveBeenCalledOnceWith('user', { accepted: true, acceptedVersion: '1', currentVersion: '1' });
  });

  it('continues the original navigation after Terms acceptance without a home redirect', async () => {
    auth.waitForAuthState.and.resolveTo({ uid: 'user', getIdToken: () => Promise.resolve('token') });
    spyOn(router, 'navigateByUrl');
    expect(await run('/tabs/detail-outfit/abc')).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('redirects a decline after one service-owned logout and fails closed when unavailable', async () => {
    auth.waitForAuthState.and.resolveTo({ uid: 'user', getIdToken: () => Promise.resolve('token') });
    terms.allowAppAccess.and.resolveTo('declined');
    expect(router.serializeUrl(await run('/tabs/myoutfit') as UrlTree)).toContain('/login?returnUrl=');
    terms.allowAppAccess.and.resolveTo('unavailable');
    expect(await run('/tabs/myoutfit')).toBeFalse();
  });

  it('keeps register and Terms routes public', () => {
    for (const path of ['login', 'register', 'intro', 'terms-conditions']) {
      const publicRoute = routes.find(route => route.path === path);
      expect(publicRoute?.canActivate).toBeUndefined();
      expect(publicRoute?.canActivateChild).toBeUndefined();
    }
  });

  it('applies the real child guard when navigating between tabs children', () => {
    const tabsRoute = routes.find(route => route.path === 'tabs');
    expect(tabsRoute?.canActivate).toBeUndefined();
    expect(tabsRoute?.canActivateChild).toEqual([authGuard]);
    expect(tabsRoute?.children?.some(child => child.path === 'myoutfit')).toBeTrue();
    expect(tabsRoute?.children?.some(child => child.path === 'my-profile')).toBeTrue();
  });
});
