import { TestBed } from '@angular/core/testing';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { UserService } from 'src/app/service/user.service';
import { RegisterPage } from './register.page';

describe('RegisterPage terms consent', () => {
  let component: RegisterPage;
  let users: jasmine.SpyObj<UserService>;
  const alert = { present: jasmine.createSpy('present').and.resolveTo() };
  const termsEvent = {
    checked: true,
    field: {
      name: 'backend-field-name', type: 'checkBox', label: 'Accetto i Termini di Servizio', required: true,
      checkBoxOptions: { haveLink: true, hrefLink: '/terms-conditions', hrefText: 'Termini di Servizio' }
    }
  };
  const registration = { email: 'user@example.com', password: 'password', displayName: 'User', nome: 'Nome', cognome: 'Cognome', gender: 'U' };

  beforeEach(() => {
    users = jasmine.createSpyObj<UserService>('UserService', ['registerUser']);
    users.registerUser.and.returnValue(of({}));
    TestBed.configureTestingModule({ providers: [
      { provide: ModalController, useValue: { create: jasmine.createSpy() } },
      { provide: AlertController, useValue: { create: jasmine.createSpy().and.resolveTo(alert) } },
    ] });
    component = TestBed.runInInjectionContext(() => new RegisterPage(
      {} as any, users, { back: jasmine.createSpy('back') } as any, TestBed.inject(AlertController)
    ));
  });

  it('does not register before Terms are accepted', () => {
    component.register(registration);
    expect(users.registerUser).not.toHaveBeenCalled();
  });

  it('sends explicit consent without server-managed fields', async () => {
    await component.functionalCheckBox(termsEvent);
    component.register(registration);
    const payload = users.registerUser.calls.mostRecent().args[1] as any;
    expect(payload.termsAccepted).toBeTrue();
    expect(payload.uid).toBeUndefined();
    expect(payload.createAt).toBeUndefined();
    expect(payload.termsVersion).toBeUndefined();
    expect(payload.termsAcceptedAt).toBeUndefined();
  });

  it('does not treat another checkbox as Terms acceptance', async () => {
    await component.functionalCheckBox({
      checked: true,
      field: { name: 'marketing', type: 'checkBox', label: 'Ricevi aggiornamenti', checkBoxOptions: { haveLink: false } }
    });
    expect(component.termsAccepted).toBeFalse();
    component.register(registration);
    expect(users.registerUser).not.toHaveBeenCalled();
  });


  it('clears consent when the technical Terms checkbox is unchecked', async () => {
    await component.functionalCheckBox(termsEvent);
    await component.functionalCheckBox({ ...termsEvent, checked: false });
    expect(component.termsAccepted).toBeFalse();
  });

  it('ignores localized labels when the technical link is not the Terms route', async () => {
    await component.functionalCheckBox({
      checked: true,
      field: { name: 'other', type: 'checkBox', label: 'Terms prize draw', checkBoxOptions: { haveLink: true, hrefLink: '/marketing', hrefText: 'Terms' } }
    });
    expect(component.termsAccepted).toBeFalse();
  });

  it('normalizes equivalent internal Terms route links', () => {
    for (const hrefLink of ['terms-conditions', '/terms-conditions', '/terms-conditions/']) {
      expect(component.isTermsCheckboxEvent({ ...termsEvent, field: { ...termsEvent.field, checkBoxOptions: { ...termsEvent.field.checkBoxOptions, hrefLink } } })).toBeTrue();
    }
  });
});
