import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AlertController, IonContent, ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { UserService } from 'src/app/service/user.service';
import { TermsConditionsPage, TermsPageMode } from './terms-conditions.page';

describe('TermsConditionsPage', () => {
  let component: TermsConditionsPage;
  let users: jasmine.SpyObj<UserService>;
  let modal: any;

  beforeEach(() => {
    users = jasmine.createSpyObj<UserService>('UserService', ['acceptTerms']);
    modal = { dismiss: jasmine.createSpy().and.resolveTo(true), getTop: jasmine.createSpy() };
    TestBed.configureTestingModule({ providers: [{ provide: ModalController, useValue: modal }] });
    component = TestBed.runInInjectionContext(() => new TermsConditionsPage(
      {} as any,
      users,
      { create: jasmine.createSpy().and.resolveTo({ present: () => Promise.resolve() }) } as any,
      TestBed.inject(NgZone)
    ));
  });

  function setMode(mode: TermsPageMode): void { component.mode = mode; }
  function scrollElement(scrollTop: number, clientHeight: number, scrollHeight: number): HTMLElement {
    const element = document.createElement('div');
    Object.defineProperties(element, {
      scrollTop: { value: scrollTop, writable: true, configurable: true },
      clientHeight: { value: clientHeight, configurable: true },
      scrollHeight: { value: scrollHeight, configurable: true }
    });
    component.content = { getScrollElement: jasmine.createSpy().and.resolveTo(element) } as unknown as IonContent;
    return element;
  }

  it('attaches one native passive scroll listener in registration mode', async () => {
    setMode('registration');
    const element = scrollElement(0, 500, 1000);
    const addListener = spyOn(element, 'addEventListener').and.callThrough();

    await component.ionViewDidEnter();

    expect((component.content?.getScrollElement as jasmine.Spy)).toHaveBeenCalledTimes(1);
    expect(addListener).toHaveBeenCalledOnceWith('scroll', jasmine.any(Function), { passive: true });
    expect(component.isScrollAtBottom).toBeFalse();
  });

  it('updates from a real native scroll event and applies tolerance', async () => {
    setMode('registration');
    const element = scrollElement(0, 500, 1000);
    await component.ionViewDidEnter();
    expect(component.isScrollAtBottom).toBeFalse();

    element.scrollTop = 497;
    element.dispatchEvent(new Event('scroll'));

    expect(component.isScrollAtBottom).toBeTrue();
  });

  it('detects no overflow immediately without a scroll event', async () => {
    setMode('registration');
    scrollElement(0, 1000, 800);
    await component.ionViewDidEnter();
    expect(component.isScrollAtBottom).toBeTrue();
  });

  it('removes the same handler and ignores old-element events after leaving', async () => {
    setMode('registration');
    const element = scrollElement(0, 500, 1000);
    const addListener = spyOn(element, 'addEventListener').and.callThrough();
    const removeListener = spyOn(element, 'removeEventListener').and.callThrough();
    await component.ionViewDidEnter();
    const attachedHandler = addListener.calls.mostRecent().args[1];
    component.ionViewWillLeave();
    expect(removeListener).toHaveBeenCalledOnceWith('scroll', attachedHandler);

    element.scrollTop = 500;
    element.dispatchEvent(new Event('scroll'));
    expect(component.isScrollAtBottom).toBeFalse();
  });

  it('does not accumulate listeners across leave and re-entry', async () => {
    setMode('authenticated');
    const first = scrollElement(0, 500, 1000);
    const firstRemove = spyOn(first, 'removeEventListener').and.callThrough();
    await component.ionViewDidEnter();
    component.ionViewWillLeave();

    const second = scrollElement(0, 500, 1000);
    const secondAdd = spyOn(second, 'addEventListener').and.callThrough();
    await component.ionViewDidEnter();

    expect(firstRemove).toHaveBeenCalledTimes(1);
    expect(secondAdd).toHaveBeenCalledTimes(1);
  });

  it('does not attach a consent listener in view mode', async () => {
    setMode('view');
    const element = scrollElement(0, 500, 1000);
    const addListener = spyOn(element, 'addEventListener').and.callThrough();
    await component.ionViewDidEnter();
    expect(addListener).not.toHaveBeenCalled();
  });

  it('fails closed when getScrollElement rejects', async () => {
    setMode('registration');
    component.isScrollAtBottom = true;
    component.content = { getScrollElement: jasmine.createSpy().and.rejectWith(new Error('DOM')) } as unknown as IonContent;
    await component.ionViewDidEnter();
    expect(component.isScrollAtBottom).toBeFalse();
  });

  it('accepts registration locally without calling the authenticated endpoint', async () => {
    setMode('registration'); component.isScrollAtBottom = true;
    await component.acceptAndContinue();
    expect(users.acceptTerms).not.toHaveBeenCalled();
    expect(modal.dismiss).toHaveBeenCalledOnceWith({ accepted: true }, 'accepted');
  });

  it('calls the backend only for authenticated acceptance and stays open on error', async () => {
    setMode('authenticated'); component.isScrollAtBottom = true;
    users.acceptTerms.and.returnValue(of({ termsVersion: '2', termsAcceptedAt: 123 }));
    await component.acceptAndContinue();
    expect(users.acceptTerms).toHaveBeenCalledTimes(1);
    modal.dismiss.calls.reset();
    users.acceptTerms.and.returnValue(throwError(() => new Error('backend')));
    await component.acceptAndContinue();
    expect(modal.dismiss).not.toHaveBeenCalled();
  });
});
