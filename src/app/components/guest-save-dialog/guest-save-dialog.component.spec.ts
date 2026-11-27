import { GuestSaveDialogComponent } from './guest-save-dialog.component';

describe('GuestSaveDialogComponent', () => {
  it('closes with the role selected by the guest without performing navigation', () => {
    const modal = { dismiss: jasmine.createSpy('dismiss').and.resolveTo(true) };
    const component = new GuestSaveDialogComponent(modal as any);
    component.close('save');
    component.close('download');
    component.close('explore');
    expect(modal.dismiss).toHaveBeenCalledWith(undefined, 'save');
    expect(modal.dismiss).toHaveBeenCalledWith(undefined, 'download');
    expect(modal.dismiss).toHaveBeenCalledWith(undefined, 'explore');
  });
});
