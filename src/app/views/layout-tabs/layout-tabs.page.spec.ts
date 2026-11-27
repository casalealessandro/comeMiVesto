import { LayoutTabsPage } from './layout-tabs.page';
import { GuestOutfitNudge } from './guest-outfit-nudge';

describe('Guest save modal: timed presentation', () => {
  const shownKey = 'cmv-guest-centered-dialog-v3-shown';
  beforeEach(() => sessionStorage.removeItem(shownKey));
  afterEach(() => sessionStorage.removeItem(shownKey));

  function createGuestPage(role: string = 'explore', failToPresent = false) {
    // Isolated component methods: no Firebase session or registration calls.
    const component = Object.create(LayoutTabsPage.prototype) as LayoutTabsPage;
    const modal = {
      present: jasmine.createSpy('present').and.callFake(async () => {
        if (failToPresent) throw new Error('Simulated Ionic presentation failure');
      }),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.resolveTo({ role }),
      dismiss: jasmine.createSpy('dismiss').and.resolveTo(true),
    };
    const modals = {
      getTop: jasmine.createSpy('getTop').and.resolveTo(undefined),
      create: jasmine.createSpy('create').and.resolveTo(modal),
    };
    const router = {
      url: '/tabs/detail-outfit/look-123',
      navigate: jasmine.createSpy('navigate').and.resolveTo(true),
    };
    const nudge = new GuestOutfitNudge();
    nudge.recordRoute(router.url);
    Object.assign(component, {
      userService: { gUserProfile: () => () => ({ isGuest: true }) },
      router,
      modalController: modals,
      guestNudge: nudge,
      guestNudgeSessionKey: shownKey,
      guestNudgeChecking: false,
      guestNudgeRetryAfter: 0,
    });
    spyOn<any>(component, 'stopGuestNudgeTracking').and.stub();
    return { component, nudge, modal, modals, router };
  }

  it('does not open before the three-minute threshold', async () => {
    const { component, nudge, modals } = createGuestPage();
    nudge.start(Date.now() - 179_000);

    await (component as any).maybeShowGuestNudge();

    expect(modals.create).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(shownKey)).toBeNull();
  });

  it('opens the centered Ionic modal at the three-minute threshold without scrolling', async () => {
    const { component, nudge, modal, modals } = createGuestPage();
    nudge.start(Date.now() - 180_100);
    spyOn(console, 'info').and.stub();

    await (component as any).maybeShowGuestNudge();

    expect(modals.create).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      cssClass: 'cmv-guest-save-modal',
      backdropDismiss: true,
      componentProps: { outfitId: 'look-123' },
    }));
    expect(modal.present).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(shownKey)).toBe('true');
  });

  it('passes the actual outfit to the existing guest registration route', async () => {
    const { component, nudge, router } = createGuestPage('save');
    nudge.start(Date.now() - 180_100);
    spyOn(console, 'info').and.stub();

    await (component as any).maybeShowGuestNudge();

    expect(router.navigate).toHaveBeenCalledOnceWith(
      ['/guestQuickRegister'], { queryParams: { outfitId: 'look-123' } },
    );
  });

  it('does not mark as shown when Ionic cannot present the modal', async () => {
    const { component, nudge } = createGuestPage('explore', true);
    nudge.start(Date.now() - 180_100);
    spyOn(console, 'warn').and.stub();
    spyOn(console, 'info').and.stub();

    await (component as any).maybeShowGuestNudge();

    expect(sessionStorage.getItem(shownKey)).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('[GUEST_NUDGE][PRESENT_FAILED]');
  });

  it('allows browsing without mandatory registration', async () => {
    const { component, nudge, router } = createGuestPage('explore');
    nudge.start(Date.now() - 180_100);
    spyOn(console, 'info').and.stub();

    await (component as any).maybeShowGuestNudge();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
