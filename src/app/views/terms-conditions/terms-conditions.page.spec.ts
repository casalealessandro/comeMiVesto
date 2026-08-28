import { TestBed } from '@angular/core/testing';
import { AlertController, ModalController } from '@ionic/angular';
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
    modal = { dismiss: jasmine.createSpy('dismiss').and.resolveTo(true), getTop: jasmine.createSpy('getTop') };
    alerts = { create: jasmine.createSpy('create').and.resolveTo({ present: jasmine.createSpy('present').and.resolveTo() }) };
    TestBed.configureTestingModule({ providers: [
      { provide: ModalController, useValue: modal },
      { provide: AlertController, useValue: alerts }
    ] });
    component = TestBed.runInInjectionContext(() => new TermsConditionsPage({} as any, users, alerts));
    component.acceptanceMode = true;
    component.isScrollAtBottom = true;
  });

  it('dismisses as accepted only after the backend succeeds', async () => {
    users.acceptTerms.and.returnValue(of({ termsVersion: '2', termsAcceptedAt: 123 }));
    await component.acceptAndContinue();
    expect(modal.dismiss).toHaveBeenCalledOnceWith({ accepted: true }, 'accepted');
  });

  it('keeps the modal open and re-enables acceptance after an error', async () => {
    users.acceptTerms.and.returnValue(throwError(() => new Error('backend')));
    await component.acceptAndContinue();
    expect(modal.dismiss).not.toHaveBeenCalled();
    expect(component.accepting).toBeFalse();
    expect(alerts.create).toHaveBeenCalled();
  });

  it('delegates decline logout ownership to the acceptance service', async () => {
    await component.decline();
    expect(modal.dismiss).toHaveBeenCalledOnceWith({ accepted: false }, 'declined');
  });
});
