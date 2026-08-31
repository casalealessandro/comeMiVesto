import { AddOutfitPage } from './add-outfit.page';
import { ApiRequestError } from '../../service/app-service';
import { Gender } from '../../service/interface/outfit-all-interface';

describe('AddOutfitPage gender and Terms errors', () => {
  let terms: any;
  let alerts: any;
  function page(profileGender: Gender): AddOutfitPage {
    terms = { allowAppAccess: jasmine.createSpy().and.resolveTo('accepted') };
    alerts = { create: jasmine.createSpy().and.resolveTo({ present: jasmine.createSpy().and.resolveTo() }) };
    const profile = { gender: profileGender };
    const userService = {
      gUserProfile: () => () => profile,
      loadUser: jasmine.createSpy('loadUser').and.resolveTo(true)
    };
    return new AddOutfitPage(
      {} as any, {} as any, {} as any, {} as any,
      {} as any, alerts, {} as any, userService as any, terms
    );
  }

  it('uses the gender selected in the form', async () => {
    expect(await page('D').resolveCreationGender('U')).toBe('U');
  });

  for (const gender of ['U', 'D'] as Gender[]) {
    it(`falls back to profile gender ${gender}`, async () => {
      expect(await page(gender).resolveCreationGender()).toBe(gender);
    });
  }

  it('returns an empty gender when the profile has none', async () => {
    expect(await page('').resolveCreationGender()).toBe('');
  });

  it('maps safe moderation to the published message', () => {
    expect(page('U').getOutfitCreationMessage({ moderationStatus: 'safe', status: 'approved' } as any)).toBe('Outfit pubblicato con successo.');
  });

  it('maps flagged moderation to the verification message', () => {
    expect(page('U').getOutfitCreationMessage({ moderationStatus: 'flagged', status: 'pending' } as any)).toContain('verificato prima della pubblicazione');
  });

  it('maps moderation errors to the temporarily unavailable message', () => {
    expect(page('U').getOutfitCreationMessage({ moderationStatus: 'error', status: 'pending' } as any)).toContain('temporaneamente disponibile');
  });


  it('opens Terms for the exact runtime code on create or edit errors', async () => {
    const component = page('U');
    expect(await component.handleTermsRequired(new ApiRequestError('Terms', 403, 'TERMS_ACCEPTANCE_REQUIRED'))).toBeTrue();
    expect(terms.allowAppAccess).toHaveBeenCalledTimes(1);
    expect(alerts.create).toHaveBeenCalled();
  });

  it('does not interpret an ordinary 403 as a Terms error', async () => {
    const component = page('U');
    expect(await component.handleTermsRequired(new ApiRequestError('Forbidden', 403))).toBeFalse();
    expect(terms.allowAppAccess).not.toHaveBeenCalled();
  });
});
