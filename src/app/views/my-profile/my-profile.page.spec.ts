import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppService } from 'src/app/service/app-service';
import { FavoriteOutfit, outfit, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { UserService } from 'src/app/service/user.service';
import { MyProfilePage } from './my-profile.page';

describe('MyProfilePage data refresh', () => {
  let component: MyProfilePage;
  let userService: jasmine.SpyObj<UserService>;
  let appService: jasmine.SpyObj<AppService>;

  const event = {
    stopPropagation: jasmine.createSpy('stopPropagation'),
    preventDefault: jasmine.createSpy('preventDefault'),
  };

  beforeEach(() => {
    userService = jasmine.createSpyObj<UserService>('UserService', [
      'gUserProfile', 'getFaveUserOutfits', 'getNumberFaveUserOutfitsNumber',
      'getUserPreference', 'getUserOutfits', 'getUserWardrobes', 'loadFaveUserOutfits',
      'delFaveUserOutfits',
    ]);
    userService.gUserProfile.and.returnValue(signal(null) as any);
    userService.getFaveUserOutfits.and.returnValue(signal([]) as any);
    userService.getNumberFaveUserOutfitsNumber.and.returnValue(signal(0) as any);
    userService.getUserPreference.and.resolveTo(null);
    userService.getUserOutfits.and.returnValue(of([]));
    userService.getUserWardrobes.and.returnValue(of([]));
    userService.loadFaveUserOutfits.and.returnValue(of([]));

    appService = jasmine.createSpyObj<AppService>('AppService', ['deleteOutfit', 'deleteWardrobe']);
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new MyProfilePage(
      userService,
      appService,
      {} as any,
      {} as any,
      { create: jasmine.createSpy('create') } as any,
      {} as any,
    ));
  });

  it('reloads outfits and counters after deleting an outfit', async () => {
    const outfits = [{ id: 'remaining' } as outfit];
    appService.deleteOutfit.and.resolveTo(true);
    userService.getUserOutfits.and.returnValue(of(outfits));

    await component.deleteOutfit(event, { id: 'deleted' } as outfit);

    expect(userService.getUserOutfits).toHaveBeenCalled();
    expect(component.userOutfits).toEqual(outfits);
    expect(component.outfitNumber).toBe(1);
    expect(component.segmentButtons[0].number).toBe(1);
  });

  it('reloads wardrobes and counters after deleting a wardrobe item', async () => {
    const wardrobes = [{ id: 'remaining', name: 'Maglia' } as wardrobesItem];
    appService.deleteWardrobe.and.resolveTo(true);
    userService.getUserWardrobes.and.returnValue(of(wardrobes));

    await component.deletewardrobesitem(event, { id: 'deleted' } as wardrobesItem);

    expect(userService.getUserWardrobes).toHaveBeenCalled();
    expect(component.userWardrobes).toEqual(wardrobes);
    expect(component.wardrobesNumber).toBe(1);
    expect(component.segmentButtons[1].number).toBe(1);
  });

  it('updates the favorites counter after favorites finish loading', async () => {
    const favorites = [{ outfitId: 'one' }, { outfitId: 'two' }] as FavoriteOutfit[];
    userService.loadFaveUserOutfits.and.returnValue(of(favorites));

    await component.loadFavoriteOutfits();

    expect(component.segmentButtons[2].number).toBe(2);
  });

  it('shows the content-flagged message for display names and profile photos', () => {
    const error = { status: 422, code: 'CONTENT_FLAGGED' } as any;
    expect(component.getProfileErrorMessage(error)).toContain('nome pubblico');
    expect(component.getProfileErrorMessage(error, true)).toContain('foto profilo');
  });

  it('shows the moderation-unavailable message for profile updates', () => {
    const error = { status: 503, code: 'MODERATION_UNAVAILABLE' } as any;
    expect(component.getProfileErrorMessage(error)).toContain('temporaneamente disponibile');
    expect(component.getProfileErrorMessage(error, true)).toContain('temporaneamente disponibile');
  });
});
