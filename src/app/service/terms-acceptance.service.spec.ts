import { of, Subject, throwError } from 'rxjs';
import { TermsStatus } from './interface/user-interface';
import { TermsAcceptanceService } from './terms-acceptance.service';

describe('TermsAcceptanceService', () => {
  const acceptedStatus: TermsStatus = { accepted: true, acceptedVersion: '2', currentVersion: '2' };
  let users: any;
  let modals: any;
  let router: any;
  let alerts: any;

  beforeEach(() => {
    users = { getTermsStatus: jasmine.createSpy(), logOut: jasmine.createSpy().and.resolveTo(true) };
    modals = { create: jasmine.createSpy() };
    router = { navigateByUrl: jasmine.createSpy().and.resolveTo(true) };
    alerts = { create: jasmine.createSpy().and.resolveTo({ present: jasmine.createSpy().and.resolveTo() }) };
  });

  it('allows an accepted user without opening a modal', async () => {
    users.getTermsStatus.and.returnValue(of(acceptedStatus));
    const service = new TermsAcceptanceService(users, modals, router, alerts);
    expect(await service.allowAppAccess()).toBeTrue();
    expect(modals.create).not.toHaveBeenCalled();
  });

  it('allows access only after the modal confirms acceptance', async () => {
    users.getTermsStatus.and.returnValue(of({ ...acceptedStatus, accepted: false }));
    modals.create.and.resolveTo({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ data: { accepted: true } }) });
    expect(await new TermsAcceptanceService(users, modals, router, alerts).allowAppAccess()).toBeTrue();
  });

  it('owns decline logout and redirects to login once', async () => {
    users.getTermsStatus.and.returnValue(of({ ...acceptedStatus, accepted: false }));
    modals.create.and.resolveTo({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ data: { accepted: false } }) });
    expect(await new TermsAcceptanceService(users, modals, router, alerts).allowAppAccess()).toBeFalse();
    expect(users.logOut).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/login');
  });

  it('fails closed and explains a terms-status error', async () => {
    users.getTermsStatus.and.returnValue(throwError(() => new Error('network')));
    expect(await new TermsAcceptanceService(users, modals, router, alerts).allowAppAccess()).toBeFalse();
    expect(modals.create).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(alerts.create).toHaveBeenCalled();
  });

  it('shares concurrent checks and opens only one modal', async () => {
    const status = new Subject<TermsStatus>();
    users.getTermsStatus.and.returnValue(status);
    modals.create.and.resolveTo({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ data: { accepted: true } }) });
    const service = new TermsAcceptanceService(users, modals, router, alerts);
    const first = service.allowAppAccess();
    const second = service.allowAppAccess();
    status.next({ ...acceptedStatus, accepted: false });
    status.complete();
    expect(await Promise.all([first, second])).toEqual([true, true]);
    expect(users.getTermsStatus).toHaveBeenCalledTimes(1);
    expect(modals.create).toHaveBeenCalledTimes(1);
  });
});
