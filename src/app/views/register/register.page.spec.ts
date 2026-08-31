import { TestBed } from '@angular/core/testing';
import { AlertController, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { DynamicFormComponent } from 'src/app/components/dynamic-form/dynamic-form.component';
import { UserService } from 'src/app/service/user.service';
import { RegisterPage } from './register.page';

describe('RegisterPage Terms consent', () => {
  let component: RegisterPage;
  let users: jasmine.SpyObj<UserService>;
  let modalController: any;
  let modalResult: { data?: { accepted: boolean } };
  let dynamicForm: jasmine.SpyObj<DynamicFormComponent>;
  const termsEvent = {
    checked: true, fieldName: 'backend-field-name',
    field: { name: 'backend-field-name', type: 'checkBox', label: 'Terms', required: true,
      checkBoxOptions: { haveLink: true, hrefLink: '/terms-conditions', hrefText: 'Terms' } }
  };
  const registration = { email: 'user@example.com', password: 'password', displayName: 'User', nome: 'Nome', cognome: 'Cognome', gender: 'U' };

  beforeEach(() => {
    modalResult = { data: { accepted: false } };
    modalController = { create: jasmine.createSpy().and.callFake(async () => ({
      present: jasmine.createSpy().and.resolveTo(), onDidDismiss: jasmine.createSpy().and.callFake(async () => modalResult)
    })) };
    users = jasmine.createSpyObj<UserService>('UserService', ['registerUser']);
    users.registerUser.and.returnValue(of({}));
    dynamicForm = jasmine.createSpyObj<DynamicFormComponent>('DynamicFormComponent', ['setFieldValue']);
    TestBed.configureTestingModule({ providers: [
      { provide: ModalController, useValue: modalController },
      { provide: AlertController, useValue: { create: jasmine.createSpy().and.resolveTo({ present: () => Promise.resolve() }) } }
    ] });
    component = TestBed.runInInjectionContext(() => new RegisterPage({} as any, users, { back: () => undefined } as any, TestBed.inject(AlertController)));
    component.registrationForm = dynamicForm;
  });

  it('starts without consent and does not submit', () => {
    expect(component.termsAccepted).toBeFalse();
    component.register(registration);
    expect(users.registerUser).not.toHaveBeenCalled();
  });

  it('keeps a manual check false and opens the registration modal', async () => {
    const interaction = component.functionalCheckBox(termsEvent);
    expect(component.termsAccepted).toBeFalse();
    expect(dynamicForm.setFieldValue).toHaveBeenCalledWith('backend-field-name', false);
    await interaction;
    expect(modalController.create).toHaveBeenCalledWith(jasmine.objectContaining({ componentProps: { mode: 'registration' } }));
  });

  it('keeps consent and checkbox false after decline or dismiss', async () => {
    await component.functionalCheckBox(termsEvent);
    expect(component.termsAccepted).toBeFalse();
    expect(dynamicForm.setFieldValue).toHaveBeenCalledWith('backend-field-name', false);
    modalResult = {};
    await component.functionalCheckBox(termsEvent);
    expect(component.termsAccepted).toBeFalse();
  });

  it('sets consent and checkbox only from an accepted modal result', async () => {
    modalResult = { data: { accepted: true } };
    await component.functionalCheckBox(termsEvent);
    expect(component.termsAccepted).toBeTrue();
    expect(dynamicForm.setFieldValue).toHaveBeenCalledWith('backend-field-name', true);
  });

  it('clears accepted consent when manually unchecked', async () => {
    modalResult = { data: { accepted: true } };
    await component.functionalCheckBox(termsEvent);
    await component.functionalCheckBox({ ...termsEvent, checked: false });
    expect(component.termsAccepted).toBeFalse();
    expect(dynamicForm.setFieldValue).toHaveBeenCalledWith('backend-field-name', false);
  });

  it('submits termsAccepted without server-managed fields only after modal acceptance', async () => {
    modalResult = { data: { accepted: true } };
    await component.functionalCheckBox(termsEvent);
    component.register(registration);
    const payload = users.registerUser.calls.mostRecent().args[1] as any;
    expect(payload.termsAccepted).toBeTrue();
    for (const field of ['uid', 'createAt', 'termsVersion', 'termsAcceptedAt']) expect(payload[field]).toBeUndefined();
  });

  it('uses the same flow for the technical Terms link and ignores other checkboxes', async () => {
    await component.functionalCheckBox({ ...termsEvent, checked: undefined, name: 'linkCheckBoxClick' });
    expect(modalController.create).toHaveBeenCalled();
    await component.functionalCheckBox({ checked: true, fieldName: 'marketing', field: {
      name: 'marketing', type: 'checkBox', label: 'Terms marketing', checkBoxOptions: { haveLink: true, hrefLink: '/marketing' }
    }});
    expect(component.termsAccepted).toBeFalse();
  });
});
