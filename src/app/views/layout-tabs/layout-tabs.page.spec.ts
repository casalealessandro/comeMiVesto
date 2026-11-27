import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LayoutTabsPage } from './layout-tabs.page';

describe('LayoutTabsPage', () => {
  let component: LayoutTabsPage;
  let fixture: ComponentFixture<LayoutTabsPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(LayoutTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Guest save modal presentation', () => {
  const shownKey = 'cmv-guest-outfit-nudge-shown';
  beforeEach(() => sessionStorage.removeItem(shownKey));
  afterEach(() => sessionStorage.removeItem(shownKey));

  function createGuestPage(role: string = 'explore', failToPresent = false) {
    const component = Object.create(LayoutTabsPage.prototype) as LayoutTabsPage;
    const modal = {
      present: jasmine.createSpy('present').and.callFake(async () => {
        if (failToPresent) throw new Error('Simulated failed Ionic presentation');
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
    Object.assign(component, {
      userService: { gUserProfile: () => () => ({ isGuest: true }) },
      router,
      modalController: modals,
      guestNudge: {
        canPromptOnPage: () => true,
        outfitToSaveOnPage: () => 'look-123',
      },
      guestNudgeSessionKey: shownKey,
      guestNudgeChecking: false,
      guestNudgePresentationFailed: false,
    });
    spyOn<any>(component, 'stopGuestNudgeTracking').and.stub();
    return { component, modal, modals, router };
  }

  it('uses Ionic ModalController, not a floating HTML card, and records the real presentation', async () => {
    const { component, modal, modals } = createGuestPage();
    spyOn(console, 'info').and.stub();

    await (component as any).maybeShowGuestNudge();

    expect(modals.create).toHaveBeenCalledWith(jasmine.objectContaining({
      cssClass: 'cmv-guest-save-modal',
      backdropDismiss: true,
      componentProps: { outfitId: 'look-123' },
    }));
    expect(modal.present).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(shownKey)).toBe('true');
  });

  it('preserves the existing guest save route when choosing the primary CTA', async () => {
    const { component, router } = createGuestPage('save');
    spyOn(console, 'info').and.stub();

    await (component as any).maybeShowGuestNudge();

    expect(router.navigate).toHaveBeenCalledOnceWith(
      ['/guestQuickRegister'], { queryParams: { outfitId: 'look-123' } },
    );
  });

  it('does not mark the invite as shown if Ionic fails to display the modal', async () => {
    const { component } = createGuestPage('explore', true);
    spyOn(console, 'warn').and.stub();
    spyOn(console, 'info').and.stub();

    await (component as any).maybeShowGuestNudge();

    expect(sessionStorage.getItem(shownKey)).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('[GUEST_NUDGE][PRESENT_FAILED]');
  });

  it('lets the guest continue without any forced registration', async () => {
    const { component, router } = createGuestPage('explore');
    spyOn(console, 'info').and.stub();

    await (component as any).maybeShowGuestNudge();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
