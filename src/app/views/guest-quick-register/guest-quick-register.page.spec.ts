import { GuestQuickRegisterPage } from './guest-quick-register.page';

describe('GuestQuickRegisterPage Terms consent', () => {
  let component: GuestQuickRegisterPage;
  let modalResult: { data?: { accepted: boolean } };
  let modalController: any;
  let http: any;

  beforeEach(() => {
    modalResult = { data: { accepted: false } };
    modalController = {
      create: jasmine.createSpy('create').and.callFake(async () => ({
        present: jasmine.createSpy('present').and.resolveTo(),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.callFake(async () => modalResult),
      })),
    };
    http = jasmine.createSpyObj('HttpClient', ['post']);

    component = new GuestQuickRegisterPage(
      http,
      {} as any,
      {} as any,
      { snapshot: { queryParamMap: { get: () => 'outfit-123' } } } as any,
      {} as any,
      modalController,
    );
    component.outfitId = 'outfit-123';
  });

  it('starts with a required, unchecked Terms checkbox and blocks guest registration', async () => {
    expect(component.termsAccepted).toBeFalse();
    component.nome = 'Mario';
    component.cognome = 'Rossi';
    component.email = 'user@example.test';
    component.password = 'test-password-123';

    await component.submit();

    expect(component.error).toContain('Termini di Servizio');
    expect(http.post).not.toHaveBeenCalled();
  });

  it('opens the existing registration Terms modal when the checkbox is selected', () => {
    const openTerms = spyOn(component, 'acceptTerms').and.resolveTo();
    component.termsCheckbox = { checked: true } as any;

    component.onTermsCheckboxChange(true);

    expect(component.termsAccepted).toBeFalse();
    expect(component.termsCheckbox.checked).toBeFalse();
    expect(openTerms).toHaveBeenCalledTimes(1);
  });

  it('sets the checkbox only after accepting in the modal', async () => {
    modalResult = { data: { accepted: true } };
    component.termsCheckbox = { checked: false } as any;

    await component.acceptTerms();

    expect(modalController.create).toHaveBeenCalledWith(jasmine.objectContaining({
      componentProps: { mode: 'registration' },
      backdropDismiss: false,
    }));
    expect(component.termsAccepted).toBeTrue();
    expect(component.termsCheckbox.checked).toBeTrue();
  });

  it('leaves the checkbox unchecked when the modal is declined or dismissed', async () => {
    component.termsCheckbox = { checked: false } as any;
    await component.acceptTerms();
    expect(component.termsAccepted).toBeFalse();
    expect(component.termsCheckbox.checked).toBeFalse();

    modalResult = {};
    await component.acceptTerms();
    expect(component.termsAccepted).toBeFalse();
    expect(component.termsCheckbox.checked).toBeFalse();
  });

  it('clears previously accepted consent when the checkbox is unchecked', () => {
    component.termsAccepted = true;
    component.onTermsCheckboxChange(false);
    expect(component.termsAccepted).toBeFalse();
    expect(modalController.create).not.toHaveBeenCalled();
  });

  it('does not reopen the Terms modal after account creation', async () => {
    component.accountCreated = true;
    await component.acceptTerms();
    expect(modalController.create).not.toHaveBeenCalled();
  });
});
