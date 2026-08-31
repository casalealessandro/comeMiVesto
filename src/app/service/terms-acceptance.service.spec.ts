import { of, Subject, throwError } from 'rxjs';
import { TermsStatus } from './interface/user-interface';
import { TermsAcceptanceService } from './terms-acceptance.service';

describe('TermsAcceptanceService', () => {
  const current: TermsStatus = { accepted: true, acceptedVersion: '2', currentVersion: '2' };
  let users: any;
  let modals: any;
  let alerts: any;

  beforeEach(() => {
    users = { getTermsStatus: jasmine.createSpy(), logOut: jasmine.createSpy().and.resolveTo(true) };
    modals = { create: jasmine.createSpy() };
    alerts = { create: jasmine.createSpy().and.resolveTo({ present: jasmine.createSpy().and.resolveTo() }) };
  });

  function service(): TermsAcceptanceService { return new TermsAcceptanceService(users, modals, alerts); }

  it('accepts current Terms without a modal', async () => {
    users.getTermsStatus.and.returnValue(of(current));
    expect(await service().allowAppAccess()).toBe('accepted');
    expect(modals.create).not.toHaveBeenCalled();
  });

  it('waits for explicit acceptance', async () => {
    users.getTermsStatus.and.returnValue(of({ ...current, accepted: false }));
    modals.create.and.resolveTo({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ data: { accepted: true } }) });
    expect(await service().allowAppAccess()).toBe('accepted');
  });

  it('logs out exactly once after decline', async () => {
    users.getTermsStatus.and.returnValue(of({ ...current, accepted: false }));
    modals.create.and.resolveTo({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ data: { accepted: false } }) });
    expect(await service().allowAppAccess()).toBe('declined');
    expect(users.logOut).toHaveBeenCalledTimes(1);
  });

  it('fails closed when status is unavailable', async () => {
    users.getTermsStatus.and.returnValue(throwError(() => new Error('network')));
    expect(await service().allowAppAccess()).toBe('unavailable');
    expect(modals.create).not.toHaveBeenCalled();
    expect(alerts.create).toHaveBeenCalled();
  });

  it('shares one check and modal between concurrent callers', async () => {
    const status = new Subject<TermsStatus>();
    users.getTermsStatus.and.returnValue(status);
    modals.create.and.resolveTo({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ data: { accepted: true } }) });
    const instance = service();
    const decisions = [instance.allowAppAccess(), instance.allowAppAccess()];
    status.next({ ...current, accepted: false });
    status.complete();
    expect(await Promise.all(decisions)).toEqual(['accepted', 'accepted']);
    expect(users.getTermsStatus).toHaveBeenCalledTimes(1);
    expect(modals.create).toHaveBeenCalledTimes(1);
  });
});
