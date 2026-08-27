import { MyOutFitPage } from './myoutfit.page';
import { of } from 'rxjs';

describe('MyOutFitPage filters and search', () => {
  function page(): MyOutFitPage {
    const component = Object.create(MyOutFitPage.prototype) as MyOutFitPage;
    component.filtersData = { categories: [], season: '', style: '' };
    component.searchText = '';
    return component;
  }

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

  it('switches suggestions back to outfits when applying manual filters', async () => {
    const component = page();
    component.selectedSegment = 'suggeriti';
    Object.assign(component, {
      appService: { getFilteredOutfits: jasmine.createSpy('getFilteredOutfits').and.returnValue(of([])) }
    });
    spyOn<any>(component, 'getReadyUserProfile').and.resolveTo({ gender: 'U' });

    await component.applyOutfitFilters();

    expect(component.selectedSegment).toBe('outfit');
  });
});
