import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { routes } from './app-routing.module';
import { authGuard } from './auth.guard';
import { TermsAcceptanceService } from './service/terms-acceptance.service';
import { UserService } from './service/user.service';

describe('protected routing', () => {
  let auth: any;
  let users: any;
  let terms: any;
  let router: Router;

  beforeEach(() => {
    auth = { authState: of(null) };
    users = { getUserProfile: jasmine.createSpy().and.returnValue(of({ uid: 'user' })), setUserInfo: jasmine.createSpy() };
    terms = { allowAppAccess: jasmine.createSpy().and.resolveTo('accepted') };
    TestBed.configureTestingModule({ imports: [RouterTestingModule], providers: [
      { provide: AngularFireAuth, useValue: auth }, { provide: UserService, useValue: users },
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

  it('allows the original protected route when signed in with current Terms', async () => {
    auth.authState = of({ uid: 'user', getIdToken: () => Promise.resolve('token') });
    expect(await run('/tabs/detail-outfit/abc')).toBeTrue();
    expect(terms.allowAppAccess).toHaveBeenCalledTimes(1);
  });

  it('continues the original navigation after Terms acceptance without a home redirect', async () => {
    auth.authState = of({ uid: 'user', getIdToken: () => Promise.resolve('token') });
    spyOn(router, 'navigateByUrl');
    expect(await run('/tabs/detail-outfit/abc')).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('redirects a decline after one service-owned logout and fails closed when unavailable', async () => {
    auth.authState = of({ uid: 'user', getIdToken: () => Promise.resolve('token') });
    terms.allowAppAccess.and.resolveTo('declined');
    expect(router.serializeUrl(await run('/tabs/myoutfit') as UrlTree)).toContain('/login?returnUrl=');
    terms.allowAppAccess.and.resolveTo('unavailable');
    expect(await run('/tabs/myoutfit')).toBeFalse();
  });

  it('keeps register and Terms routes public', () => {
    for (const path of ['register', 'terms-conditions']) {
      expect(routes.find(route => route.path === path)?.canActivate).toBeUndefined();
    }
  });
});
