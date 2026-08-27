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
});
