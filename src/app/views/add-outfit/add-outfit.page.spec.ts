import { AddOutfitPage } from './add-outfit.page';
import { Gender } from '../../service/interface/outfit-all-interface';

describe('AddOutfitPage gender', () => {
  function page(profileGender: Gender): AddOutfitPage {
    const profile = { gender: profileGender };
    const userService = {
      gUserProfile: () => () => profile,
      loadUser: jasmine.createSpy('loadUser').and.resolveTo(true)
    };
    return new AddOutfitPage(
      {} as any, {} as any, {} as any, {} as any,
      {} as any, {} as any, {} as any, userService as any
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
});
