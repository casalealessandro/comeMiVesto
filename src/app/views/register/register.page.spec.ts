import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { DynamicFormComponent } from 'src/app/components/dynamic-form/dynamic-form.component';
import { UserService } from 'src/app/service/user.service';
import { SocialAuthService } from 'src/app/service/social-auth.service';
import { RegisterPage } from './register.page';

describe('RegisterPage Terms consent', () => {
  let component: RegisterPage;
  let users: jasmine.SpyObj<UserService>;
  let modalController: any;
  let modalResult: { data?: { accepted: boolean } };
  let dynamicForm: jasmine.SpyObj<DynamicFormComponent>;
  let router: jasmine.SpyObj<Router>;
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
    users = jasmine.createSpyObj<UserService>('UserService', [
      'registerUser', 'completeRegistration', 'completeAuthenticatedSession', 'gUserProfile', 'gTermsStatus'
    ]);
    users.registerUser.and.returnValue(of({}));
    users.completeRegistration.and.returnValue(of({} as any));
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.resolveTo(true);
    dynamicForm = jasmine.createSpyObj<DynamicFormComponent>('DynamicFormComponent', ['setFieldValue']);
    TestBed.configureTestingModule({ providers: [
      { provide: ModalController, useValue: modalController },
      { provide: AlertController, useValue: { create: jasmine.createSpy().and.resolveTo({ present: () => Promise.resolve() }) } },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      { provide: Router, useValue: router },
      { provide: SocialAuthService, useValue: { getPendingProfile: () => null, clearPendingProfile: jasmine.createSpy() } }
    ] });
    component = TestBed.runInInjectionContext(() => new RegisterPage(
      users,
      { back: () => undefined } as any,
      TestBed.inject(AlertController),
      { auth: {} } as any,
      TestBed.inject(SocialAuthService),
      TestBed.inject(ActivatedRoute),
      router
    ));
    spyOn<any>(component, 'completeRegistrationSession').and.resolveTo();
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
    for (const field of ['uid', 'createAt', 'termsVersion', 'termsAcceptedAt', 'privacyAccepted']) expect(payload[field]).toBeUndefined();
  });

  it('completes social registration without sending privacy consent', async () => {
    component.socialGender = 'U';
    component.termsAccepted = true;

    await component.completeSocialRegistration();

    const payload = users.completeRegistration.calls.mostRecent().args[0] as any;
    expect(payload.termsAccepted).toBeTrue();
    expect(payload.privacyAccepted).toBeUndefined();
  });

  it('starts the Firebase session flow after a successful registration', async () => {
    modalResult = { data: { accepted: true } };
    await component.functionalCheckBox(termsEvent);
    component.register(registration);

    expect((component as any).completeRegistrationSession).toHaveBeenCalledWith(
      registration.email,
      registration.password
    );
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
