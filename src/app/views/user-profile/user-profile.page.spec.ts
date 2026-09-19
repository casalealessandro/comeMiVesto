import { BehaviorSubject, of, throwError } from 'rxjs';
import { UserProfilePage } from './user-profile.page';

function createPage(options: {
  uid?: string | null;
  profile?: any;
  outfits?: any[];
  following?: boolean;
  authenticatedUid?: string;
} = {}) {
  const uid = options.uid === undefined ? 'other-user' : options.uid;
  const profile = options.profile === undefined
    ? { uid: 'other-user', displayName: 'Altro utente', photoURL: '', bio: 'Bio' }
    : options.profile;
  const appService = {
    getPublicUserProfile: jasmine.createSpy().and.returnValue(of(profile)),
    getPublicUserOutfits: jasmine.createSpy().and.returnValue(of(options.outfits ?? [])),
    recordOutfitVisit: jasmine.createSpy().and.resolveTo({}),
  };
  const userService = {
    getFollowStatus: jasmine.createSpy().and.returnValue(of({ following: options.following ?? false })),
    followUser: jasmine.createSpy().and.returnValue(of(undefined)),
    unfollowUser: jasmine.createSpy().and.returnValue(of(undefined)),
    gUserProfile: jasmine.createSpy().and.returnValue(() => options.authenticatedUid
      ? { uid: options.authenticatedUid }
      : null),
  };
  const alert = { present: jasmine.createSpy().and.resolveTo() };
  const alertController = { create: jasmine.createSpy().and.resolveTo(alert) };
  const router = { navigate: jasmine.createSpy().and.resolveTo(true) };
  const routeParams = new BehaviorSubject({ get: () => uid });
  const route = {
    snapshot: { paramMap: { get: () => uid } },
    paramMap: routeParams.asObservable(),
  };
  const page = new UserProfilePage(route as any, router as any, appService as any, userService as any, alertController as any);
  return { page, appService, userService, alertController, alert, router, routeParams };
}

describe('UserProfilePage', () => {
  it('loads the public profile and outfits from the route uid without touching the authenticated profile', async () => {
    const authenticatedProfile = { uid: 'me', displayName: 'Io' };
    const context = createPage({ outfits: [{ id: 'outfit-1' }] });
    context.userService.gUserProfile.and.returnValue(() => authenticatedProfile);

    await context.page.ngOnInit();

    expect(context.appService.getPublicUserProfile).toHaveBeenCalledOnceWith('other-user');
    expect(context.appService.getPublicUserOutfits).toHaveBeenCalledOnceWith('other-user');
    expect(context.page.outfits).toEqual([{ id: 'outfit-1' }] as any);
    expect(context.userService.gUserProfile()).toBe(authenticatedProfile);
  });

  it('redirects to MyProfilePage when the route uid is the authenticated user', async () => {
    const context = createPage({ uid: 'me', authenticatedUid: 'me' });

    await context.page.ngOnInit();

    expect(context.router.navigate).toHaveBeenCalledOnceWith(['/tabs/my-profile']);
    expect(context.appService.getPublicUserProfile).not.toHaveBeenCalled();
    expect(context.appService.getPublicUserOutfits).not.toHaveBeenCalled();
    expect(context.userService.getFollowStatus).not.toHaveBeenCalled();
  });

  it('reloads profile state when the route uid changes', async () => {
    const context = createPage();
    context.appService.getPublicUserProfile.and.callFake((uid: string) =>
      of({ uid, displayName: uid, photoURL: '', bio: '' })
    );

    await context.page.ngOnInit();
    context.routeParams.next({ get: () => 'second-user' });
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(context.page.uid).toBe('second-user');
    expect(context.appService.getPublicUserProfile).toHaveBeenCalledWith('second-user');
    expect(context.appService.getPublicUserOutfits).toHaveBeenCalledWith('second-user');
    expect(context.userService.getFollowStatus).toHaveBeenCalledWith('second-user');
  });

  it('records a visit after opening another user outfit', async () => {
    const context = createPage({ authenticatedUid: 'me' });
    await context.page.ngOnInit();

    await context.page.openOutfit({ id: 'outfit-1', userId: 'other-user' } as any);

    expect(context.router.navigate).toHaveBeenCalledWith(['/tabs/detail-outfit', 'outfit-1']);
    expect(context.appService.recordOutfitVisit).toHaveBeenCalledOnceWith('outfit-1');
  });

  it('loads true and false follow states', async () => {
    const following = createPage({ following: true });
    await following.page.ngOnInit();
    expect(following.page.isFollowing).toBeTrue();

    const notFollowing = createPage({ following: false });
    await notFollowing.page.ngOnInit();
    expect(notFollowing.page.isFollowing).toBeFalse();
  });

  it('follows and immediately updates the button state', async () => {
    const context = createPage();
    await context.page.ngOnInit();
    await context.page.toggleFollow();
    expect(context.userService.followUser).toHaveBeenCalledOnceWith('other-user');
    expect(context.page.isFollowing).toBeTrue();
  });

  it('unfollows and immediately updates the button state', async () => {
    const context = createPage({ following: true });
    await context.page.ngOnInit();
    await context.page.toggleFollow();
    expect(context.userService.unfollowUser).toHaveBeenCalledOnceWith('other-user');
    expect(context.page.isFollowing).toBeFalse();
  });

  it('keeps the previous state and presents an alert when follow fails', async () => {
    const context = createPage();
    context.userService.followUser.and.returnValue(throwError(() => new Error('failed')));
    await context.page.ngOnInit();
    await context.page.toggleFollow();
    expect(context.page.isFollowing).toBeFalse();
    expect(context.alert.present).toHaveBeenCalled();
  });

  it('keeps an empty outfit list for the empty-state message', async () => {
    const context = createPage({ outfits: [] });
    await context.page.ngOnInit();
    expect(context.page.outfits.length).toBe(0);
  });

  it('handles a missing uid without requesting data', async () => {
    const context = createPage({ uid: null });
    await context.page.ngOnInit();
    expect(context.page.loadError).toBeTrue();
    expect(context.appService.getPublicUserProfile).not.toHaveBeenCalled();
  });
});
