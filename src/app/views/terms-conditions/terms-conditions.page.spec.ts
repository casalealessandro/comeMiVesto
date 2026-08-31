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
    component = TestBed.runInInjectionContext(() => new TermsConditionsPage({} as any, users, {
      create: jasmine.createSpy().and.resolveTo({ present: () => Promise.resolve() })
    } as any));
  });

  function setMode(mode: TermsPageMode): void { component.mode = mode; }
  function scrollElement(scrollTop: number, clientHeight: number, scrollHeight: number): void {
    component.content = { getScrollElement: jasmine.createSpy().and.resolveTo({ scrollTop, clientHeight, scrollHeight }) } as unknown as IonContent;
  }

  it('preserves bottom, tolerance, no-overflow and fail-closed scroll behavior', async () => {
    setMode('registration');
    scrollElement(0, 500, 1000); await component.updateScrollState(); expect(component.isScrollAtBottom).toBeFalse();
    scrollElement(497, 500, 1000); await component.updateScrollState(); expect(component.isScrollAtBottom).toBeTrue();
    scrollElement(0, 1000, 800); await component.updateScrollState(); expect(component.isScrollAtBottom).toBeTrue();
    component.content = { getScrollElement: jasmine.createSpy().and.rejectWith(new Error('DOM')) } as unknown as IonContent;
    await component.updateScrollState(); expect(component.isScrollAtBottom).toBeFalse();
  });

  it('does not accept registration before the bottom', async () => {
    setMode('registration');
    await component.acceptAndContinue();
    expect(modal.dismiss).not.toHaveBeenCalled();
    expect(users.acceptTerms).not.toHaveBeenCalled();
  });

  it('accepts registration locally without calling the authenticated endpoint', async () => {
    setMode('registration'); component.isScrollAtBottom = true;
    await component.acceptAndContinue();
    expect(users.acceptTerms).not.toHaveBeenCalled();
    expect(modal.dismiss).toHaveBeenCalledOnceWith({ accepted: true }, 'accepted');
  });

  it('declines registration explicitly', async () => {
    setMode('registration');
    await component.decline();
    expect(modal.dismiss).toHaveBeenCalledOnceWith({ accepted: false }, 'declined');
  });

  it('calls the backend exactly once for authenticated acceptance', async () => {
    setMode('authenticated'); component.isScrollAtBottom = true;
    users.acceptTerms.and.returnValue(of({ termsVersion: '2', termsAcceptedAt: 123 }));
    await component.acceptAndContinue();
    expect(users.acceptTerms).toHaveBeenCalledTimes(1);
    expect(modal.dismiss).toHaveBeenCalledWith({ accepted: true }, 'accepted');
  });

  it('keeps the authenticated modal open when the backend fails', async () => {
    setMode('authenticated'); component.isScrollAtBottom = true;
    users.acceptTerms.and.returnValue(throwError(() => new Error('backend')));
    await component.acceptAndContinue();
    expect(modal.dismiss).not.toHaveBeenCalled();
    expect(component.accepting).toBeFalse();
  });

  it('view mode never produces consent or calls the backend', async () => {
    setMode('view'); component.isScrollAtBottom = true;
    await component.acceptAndContinue();
    expect(users.acceptTerms).not.toHaveBeenCalled();
    expect(modal.dismiss).not.toHaveBeenCalled();
  });
});
