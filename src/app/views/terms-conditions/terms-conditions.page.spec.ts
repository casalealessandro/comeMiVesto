import { TestBed } from '@angular/core/testing';
import { AlertController, IonContent, ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { UserService } from 'src/app/service/user.service';
import { TermsConditionsPage } from './terms-conditions.page';

describe('TermsConditionsPage acceptance', () => {
  let component: TermsConditionsPage;
  let users: jasmine.SpyObj<UserService>;
  let modal: any;
  let alerts: any;

  beforeEach(() => {
    users = jasmine.createSpyObj<UserService>('UserService', ['acceptTerms']);
    modal = { dismiss: jasmine.createSpy().and.resolveTo(true), getTop: jasmine.createSpy() };
    alerts = { create: jasmine.createSpy().and.resolveTo({ present: jasmine.createSpy().and.resolveTo() }) };
    TestBed.configureTestingModule({ providers: [{ provide: ModalController, useValue: modal }] });
    component = TestBed.runInInjectionContext(() => new TermsConditionsPage({} as any, users, alerts as AlertController));
    component.acceptanceMode = true;
  });

  function scrollElement(scrollTop: number, clientHeight: number, scrollHeight: number): void {
    component.content = { getScrollElement: jasmine.createSpy().and.resolveTo({ scrollTop, clientHeight, scrollHeight }) } as unknown as IonContent;
  }

  it('does not enable acceptance before the bottom', async () => {
    scrollElement(0, 500, 1000);
    await component.updateScrollState();
    expect(component.isScrollAtBottom).toBeFalse();
  });

  it('enables acceptance at the bottom and within tolerance', async () => {
    scrollElement(500, 500, 1000);
    await component.updateScrollState();
    expect(component.isScrollAtBottom).toBeTrue();
    scrollElement(497, 500, 1000);
    await component.updateScrollState();
    expect(component.isScrollAtBottom).toBeTrue();
  });

  it('enables acceptance when all content is visible', async () => {
    scrollElement(0, 1000, 800);
    await component.updateScrollState();
    expect(component.isScrollAtBottom).toBeTrue();
  });

  it('fails closed when the scroll element cannot be read', async () => {
    component.isScrollAtBottom = true;
    component.content = { getScrollElement: jasmine.createSpy().and.rejectWith(new Error('DOM')) } as unknown as IonContent;
    await component.updateScrollState();
    expect(component.isScrollAtBottom).toBeFalse();
  });

  it('dismisses only after the backend accepts and stays open on error', async () => {
    component.isScrollAtBottom = true;
    users.acceptTerms.and.returnValue(of({ termsVersion: '2', termsAcceptedAt: 123 }));
    await component.acceptAndContinue();
    expect(modal.dismiss).toHaveBeenCalledWith({ accepted: true }, 'accepted');
    modal.dismiss.calls.reset();
    users.acceptTerms.and.returnValue(throwError(() => new Error('backend')));
    await component.acceptAndContinue();
    expect(modal.dismiss).not.toHaveBeenCalled();
    expect(component.accepting).toBeFalse();
  });
});
