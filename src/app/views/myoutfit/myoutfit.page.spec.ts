import { MyOutFitPage } from './myoutfit.page';
import { config, of, Subject } from 'rxjs';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

describe('MyOutFitPage filters and search', () => {
  function page(): MyOutFitPage {
    const component = Object.create(MyOutFitPage.prototype) as MyOutFitPage;
    component.filtersData = { categories: [], season: '', style: '' };
    component.searchText = '';
    component.selectedOccasion = null;
    component.availableOccasions = [];
    (component as any).favoriteActionsInProgress = new Set<string>();
    component.favorites = new Set<string>();
    component.outfits = [];
    (component as any).outfitPageSize = 10; // Object.create non esegue gli initializer della classe.
    component.filteredOutfits = [];
    component.outfitUserProfile = [];
    component.selectedSegment = 'outfit';
    component.isLoading = false;
    component.isLoadingMoreOutfits = false;
    component.currentOutfitPage = 1;
    component.hasMoreOutfits = true;
    component.isOutfitFilterActive = false;
    (component as any).outfitRequestVersion = 0;
    (component as any).outfitFeedGender = 'U';
    return component;
  }

  it('builds compact metadata from existing outfit fields', () => {
    const component = page();

    expect(component.getOutfitMeta({
      tags: [{}, {}, {}],
      style: 'C',
      season: 'A'
    } as any)).toBe('3 capi · Casual · Autunno');

    expect(component.getOutfitMeta({
      tags: [{}],
      style: '',
      season: ''
    } as any)).toBe('1 capo');
  });

  it('builds search-only payloads with trim', () => {
    const component = page();
    component.searchText = '  giacca elegante  ';
    expect(component.buildOutfitFilterPayload()).toEqual({ categories: [], season: '', style: '', search: 'giacca elegante' });
  });

  it('preserves whitespace while typing and trims only the payload', () => {
    jasmine.clock().install();
    const component = page();
    spyOn(component, 'applyOutfitFilters').and.resolveTo();

    component.onSearchInput(new CustomEvent('ionInput', { detail: { value: 'giacca ' } }));

    expect(component.searchText).toBe('giacca ');
    expect(component.buildOutfitFilterPayload().search).toBe('giacca');
    jasmine.clock().uninstall();
  });

  it('combines search with season, style and categories', () => {
    const component = page();
    component.searchText = 'giacca';
    component.filtersData = {
      season: 'E', style: 'C',
      categories: [{ outfitCategory: 'M', outfitSubCategory: 'TS', color: 'N' }]
    };
    expect(component.buildOutfitFilterPayload()).toEqual({
      categories: [{ outfitCategory: 'M', outfitSubCategory: 'TS', color: 'N' }],
      season: 'E', style: 'C', search: 'giacca'
    });
  });

  it('supports category-only, category plus color, and multiple categories', () => {
    const component = page();
    component.filtersData.categories = [
      { outfitCategory: 'M' },
      { outfitSubCategory: 'TS', color: 'N' }
    ];
    expect(component.buildOutfitFilterPayload().categories).toEqual([
      { outfitCategory: 'M', outfitSubCategory: undefined, color: undefined },
      { outfitCategory: undefined, outfitSubCategory: 'TS', color: 'N' }
    ]);
  });

  it('removes search without losing modal filters', () => {
    const component = page();
    component.filtersData.season = 'E';
    component.searchText = '';
    expect(component.buildOutfitFilterPayload()).toEqual({ categories: [], season: 'E', style: '' });
  });

  it('debounces input for 350 ms', () => {
    jasmine.clock().install();
    const component = page();
    spyOn(component, 'applyOutfitFilters').and.resolveTo();
    component.onSearchInput(new CustomEvent('ionInput', { detail: { value: 'g' } }));
    component.onSearchInput(new CustomEvent('ionInput', { detail: { value: 'giacca' } }));
    jasmine.clock().tick(349);
    expect(component.applyOutfitFilters).not.toHaveBeenCalled();
    jasmine.clock().tick(1);
    expect(component.applyOutfitFilters).toHaveBeenCalledTimes(1);
    jasmine.clock().uninstall();
  });

  it('consumes the product detail filter and removes it from the URL', async () => {
    const component = page();
    const route = {
      snapshot: {
        queryParamMap: {
          get: (key: string) => ({
            source: 'product',
            outfitCategory: 'M',
            outfitSubCategory: 'TS',
            color: 'N'
          } as Record<string, string>)[key] ?? null
        }
      }
    };
    const router = { url: '/tabs/myoutfit?source=product&outfitCategory=M&outfitSubCategory=TS&color=N' };
    const location = { replaceState: jasmine.createSpy('replaceState') };

    Object.assign(component, { route, router, location });
    spyOn(component, 'applyOutfitFilters').and.resolveTo();

    await (component as any).applyProductFilterFromRoute();

    expect(component.filtersData).toEqual({
      categories: [{ outfitCategory: 'M', outfitSubCategory: 'TS', color: 'N' }],
      season: '',
      style: ''
    });
    expect(component.applyOutfitFilters).toHaveBeenCalledTimes(1);
    expect(location.replaceState).toHaveBeenCalledOnceWith('/tabs/myoutfit');
  });

  it('clears the product detail filter when leaving the outfit segment', () => {
    const component = page();
    (component as any).productFilterFromDetailActive = true;
    component.filtersData = {
      categories: [{ outfitCategory: 'M', outfitSubCategory: 'TS', color: 'N' }],
      season: '',
      style: ''
    };
    spyOn(component, 'filterUserOutFit').and.resolveTo();

    component.onSegmentChange({ detail: { value: 'suggeriti' } } as unknown as CustomEvent);

    expect(component.filtersData).toEqual({ categories: [], season: '', style: '' });
    expect((component as any).productFilterFromDetailActive).toBeFalse();
  });

  it('switches suggestions back to outfits when applying manual filters', async () => {
    const component = page();
    component.selectedSegment = 'suggeriti';
    component.filtersData.season = 'E';
    Object.assign(component, {
      appService: { getFilteredOutfits: jasmine.createSpy('getFilteredOutfits').and.returnValue(of([])) }
    });
    spyOn<any>(component, 'getReadyUserProfile').and.resolveTo({ gender: 'U' });

    await component.applyOutfitFilters();

    expect(component.selectedSegment).toBe('outfit');
  });


  it('requests only the first 10 outfits on initial load and exposes whether more are available', async () => {
    const component = page();
    const outfits = Array.from({ length: 10 }, (_, index) => ({ id: String(index) })) as any[];
    const appService = {
      getOutfitsPage: jasmine.createSpy('getOutfitsPage').and.returnValue(of({
        data: outfits, pagination: { page: 1, limit: 10, total: 24 }
      }))
    };
    Object.assign(component, {
      appService,
      categoryService: { fetchCategories: jasmine.createSpy('fetchCategories') },
      cUserID: ''
    });
    spyOn<any>(component, 'getReadyUserProfile').and.resolveTo({ uid: 'me', gender: 'U' });
    spyOn<any>(component, 'clearConsumedProductFilter').and.stub();
    spyOn<any>(component, 'applyProductFilterFromRoute').and.resolveTo();
    spyOn(component, 'loadOutfits').and.callFake(async () => {
      component.filteredOutfits = component.outfits;
    });

    await component.refreshOutfitsFromServer();

    expect(appService.getOutfitsPage).toHaveBeenCalledOnceWith('U', 1, 10, undefined);
    expect(component.filteredOutfits.length).toBe(10);
    expect(component.currentOutfitPage).toBe(1);
    expect(component.hasMoreOutfits).toBeTrue();
  });

  it('appends the next page without duplicates and stops when total is reached', async () => {
    const component = page();
    component.outfits = [{ id: 'one' } as any];
    component.filteredOutfits = [{ id: 'one' } as any];
    const appService = {
      getOutfitsPage: jasmine.createSpy('getOutfitsPage').and.returnValue(of({
        data: [{ id: 'one' }, { id: 'two' }],
        pagination: { page: 2, limit: 10, total: 2 }
      }))
    };
    Object.assign(component, { appService });
    spyOn<any>(component, 'loadOutfitAuthorProfiles').and.stub();
    const scroll = { complete: jasmine.createSpy('complete').and.resolveTo(), disabled: false };
    const event = { target: scroll } as unknown as InfiniteScrollCustomEvent;

    await component.loadMoreOutfits(event);
    await component.loadMoreOutfits(event);

    expect(appService.getOutfitsPage).toHaveBeenCalledOnceWith('U', 2, 10, undefined);
    expect(component.filteredOutfits.map(item => item.id)).toEqual(['one', 'two']);
    expect(component.currentOutfitPage).toBe(2);
    expect(component.hasMoreOutfits).toBeFalse();
    expect(scroll.disabled).toBeTrue();
    expect(scroll.complete).toHaveBeenCalledTimes(2);
  });

  it('does not append obsolete requests when changing to suggestions', async () => {
    const component = page();
    const pending = new Subject<any>();
    const appService = {
      getOutfitsPage: jasmine.createSpy('getOutfitsPage').and.returnValue(pending)
    };
    Object.assign(component, { appService });
    spyOn(component, 'filterUserOutFit').and.resolveTo();
    spyOn<any>(component, 'loadOutfitAuthorProfiles').and.stub();
    const scroll = { complete: jasmine.createSpy('complete').and.resolveTo(), disabled: false };
    const loading = component.loadMoreOutfits({ target: scroll } as unknown as InfiniteScrollCustomEvent);

    component.onSegmentChange({ detail: { value: 'suggeriti' } } as CustomEvent);
    pending.next({ data: [{ id: 'late' }], pagination: { page: 2, limit: 10, total: 25 } });
    pending.complete();
    await loading;

    expect(component.filteredOutfits).toEqual([]);
    expect(component.currentOutfitPage).toBe(1);
    expect(scroll.complete).toHaveBeenCalled();
  });

  it('restores the paginated feed when filters are cleared', async () => {
    const component = page();
    component.isOutfitFilterActive = true;
    spyOn(component, 'refreshOutfitsFromServer').and.resolveTo();

    await component.applyOutfitFilters();

    expect(component.refreshOutfitsFromServer).toHaveBeenCalledTimes(1);
    expect(component.isOutfitFilterActive).toBeTrue(); // refresh mock skips state reset
  });

  it('renders shared occasion icons and excludes inactive or missing images', async () => {
    const component = page();
    const validImage = { imageBase64: 'YWJjZA==', imageMimeType: 'image/jpeg', imageFileName: 'office.jpg' };
    Object.assign(component, { appService: {
      getOutfitOccasions: jasmine.createSpy().and.returnValue(of([
        { id: 'EVENING', value: 'Sera', active: true, order: 3, image: validImage },
        { id: 'OFFICE', value: 'Ufficio', active: true, order: 2, image: validImage },
        { id: 'SPORT', value: 'Sport', active: false, order: 4, image: validImage },
        { id: 'TRAVEL', value: 'Viaggio', active: true, order: 5 }
      ]))
    } });

    await (component as any).loadOccasions();

    expect(component.availableOccasions.map(item => item.id)).toEqual(['OFFICE', 'EVENING']);
    expect(component.occasionImageUrl(component.availableOccasions[0]))
      .toBe('data:image/jpeg;base64,YWJjZA==');
  });

  it('selects an occasion and keeps the existing paginated feed', async () => {
    const component = page();
    Object.assign(component, {
      appService: { getOutfitsPage: jasmine.createSpy().and.returnValue(of({
        data: [], pagination: { page: 1, limit: 10, total: 0 }
      })) },
      categoryService: { fetchCategories: jasmine.createSpy() }
    });
    spyOn<any>(component, 'getReadyUserProfile').and.resolveTo({ uid: 'me', gender: 'U' });
    spyOn<any>(component, 'clearConsumedProductFilter').and.stub();
    spyOn<any>(component, 'applyProductFilterFromRoute').and.resolveTo();
    spyOn(component, 'loadOutfits').and.stub();

    await component.selectOccasion('OFFICE');

    expect(component.selectedOccasion).toBe('OFFICE');
    expect((component as any).appService.getOutfitsPage).toHaveBeenCalledOnceWith('U', 1, 10, 'OFFICE');
  });

  it('keeps occasion and other filters together in the existing filtering endpoint', async () => {
    const component = page();
    component.selectedOccasion = 'APERITIVO';
    component.filtersData.season = 'E';
    const filtered = jasmine.createSpy('getFilteredOutfits').and.returnValue(of([]));
    Object.assign(component, { appService: { getFilteredOutfits: filtered } });
    spyOn<any>(component, 'getReadyUserProfile').and.resolveTo({ gender: 'D' });

    await component.applyOutfitFilters();

    expect(filtered).toHaveBeenCalledWith('gender=D', {
      categories: [], season: 'E', style: '', occasion: 'APERITIVO'
    });
  });

  it('clears the occasion back to all without resetting other filters', async () => {
    const component = page();
    component.selectedOccasion = 'OFFICE';
    component.filtersData.style = 'C';
    spyOn(component, 'applyOutfitFilters').and.resolveTo();

    await component.selectOccasion(null);

    expect(component.selectedOccasion).toBeNull();
    expect(component.filtersData.style).toBe('C');
    expect(component.applyOutfitFilters).toHaveBeenCalledTimes(1);
  });

  it('opens a public profile when the outfit author is another user', () => {
    const component = page();
    const router = { navigate: jasmine.createSpy().and.resolveTo(true) };
    Object.assign(component, { router, cUserID: 'me' });
    component.openUserProfile('other');
    expect(router.navigate).toHaveBeenCalledOnceWith(['/tabs/user-profile', 'other']);
  });

  it('opens MyProfilePage when the outfit author is the authenticated user', () => {
    const component = page();
    const router = { navigate: jasmine.createSpy().and.resolveTo(true) };
    Object.assign(component, { router, cUserID: 'me' });
    component.openUserProfile('me');
    expect(router.navigate).toHaveBeenCalledOnceWith(['/tabs/my-profile']);
  });

  it('allows only one concurrent favorite request per outfit and releases the guard', async () => {
    const component = page();
    const pending = new Subject<any>();
    const userProfileService = {
      saveFaveUserOutfits: jasmine.createSpy('saveFaveUserOutfits').and.returnValue(pending)
    };
    Object.assign(component, { userProfileService });

    const first = component.addFavoriteOutfit({ id: 'one' });
    const duplicate = component.addFavoriteOutfit({ id: 'one' });
    component.addFavoriteOutfit({ id: 'two' });

    expect(userProfileService.saveFaveUserOutfits).toHaveBeenCalledTimes(2);
    pending.next([]);
    pending.complete();
    await Promise.all([first, duplicate]);

    userProfileService.saveFaveUserOutfits.and.returnValue(of([]));
    await component.addFavoriteOutfit({ id: 'one' });
    expect(userProfileService.saveFaveUserOutfits).toHaveBeenCalledTimes(3);
  });

  it('releases the favorite guard after an error', async () => {
    const component = page();
    const userProfileService = {
      saveFaveUserOutfits: jasmine.createSpy('saveFaveUserOutfits').and.returnValues(
        new Subject<any>(), of([])
      )
    };
    Object.assign(component, { userProfileService });
    const errorRequest = new Subject<any>();
    userProfileService.saveFaveUserOutfits.and.returnValues(errorRequest, of([]));
    const previousUnhandledError = config.onUnhandledError;
    config.onUnhandledError = () => undefined;
    component.addFavoriteOutfit({ id: 'one' });
    errorRequest.error(new Error('failed'));
    await component.addFavoriteOutfit({ id: 'one' });
    expect(userProfileService.saveFaveUserOutfits).toHaveBeenCalledTimes(2);
    await new Promise(resolve => setTimeout(resolve));
    config.onUnhandledError = previousUnhandledError;
  });

  it('refreshes the server-authoritative feed after blocking without calling the lifecycle', async () => {
    const component = page();
    const appService = { blockUser: jasmine.createSpy().and.resolveTo({}) };
    Object.assign(component, { appService, cUserID: 'me', isOutfitCompositionOpen: true });
    spyOn(component, 'refreshOutfitsFromServer').and.resolveTo();
    spyOn(component, 'ionViewWillEnter').and.resolveTo();

    await component.blockOutfitUser({ userId: 'other' } as any);

    expect(appService.blockUser).toHaveBeenCalledOnceWith('other');
    expect(component.refreshOutfitsFromServer).toHaveBeenCalledTimes(1);
    expect(component.ionViewWillEnter).not.toHaveBeenCalled();
  });

  it('loads catalog products using saved color and brand preferences', async () => {
    const component = page();
    component.cUserPreference = { uid: 'user', color: ['N'], brend: ['Z'], style: ['C'] };
    const product = { id: 'product-1', name: 'Giacca', brand: 'Zara', brend: 'Zara', imageUrl: 'image', price: 49.9 } as any;
    const appService = {
      filterOutfitProducts: jasmine.createSpy('filterOutfitProducts').and.resolveTo({
        data: [product],
        pagination: { nextCursor: null, hasMore: false }
      }),
      getOutfitProducts: jasmine.createSpy('getOutfitProducts')
    };
    Object.assign(component, { appService });

    await component.loadSuggestedProducts('U');

    expect(appService.filterOutfitProducts).toHaveBeenCalledOnceWith({
      color: ['N'],
      brend: ['Z'],
      gender: 'U',
      limit: 6
    });
    expect(component.suggestedProducts).toEqual([product]);
    expect(component.isSuggestedProductsLoading).toBeFalse();
  });

  it('falls back to the gender catalog when preferences return no products', async () => {
    const component = page();
    component.cUserPreference = { uid: 'user', color: ['N'], brend: [], style: [] };
    const product = { id: 'product-1', name: 'Giacca' } as any;
    const appService = {
      filterOutfitProducts: jasmine.createSpy('filterOutfitProducts').and.resolveTo({
        data: [],
        pagination: { nextCursor: null, hasMore: false }
      }),
      getOutfitProducts: jasmine.createSpy('getOutfitProducts').and.resolveTo({
        data: [product],
        pagination: { nextCursor: null, hasMore: false }
      })
    };
    Object.assign(component, { appService });

    await component.loadSuggestedProducts('D');

    expect(appService.getOutfitProducts).toHaveBeenCalledOnceWith({ gender: 'D', limit: 6 });
    expect(component.suggestedProducts).toEqual([product]);
  });

});
