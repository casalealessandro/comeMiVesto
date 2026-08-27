import { signal } from '@angular/core';
import { FilterOutfitsPage } from './filter-outfits.page';

describe('FilterOutfitsPage modal result', () => {
  function page() {
    const modalController = { dismiss: jasmine.createSpy('dismiss').and.resolveTo(true) };
    const component = Object.create(FilterOutfitsPage.prototype) as FilterOutfitsPage;
    Object.assign(component, {
      modalController,
      selectedFilterStyleIndex: signal<number | null>(null),
      selectedFilterSeasonIndex: signal<number | null>(null),
      filterItmClothing: { categories: [], season: '', style: '' }
    });
    return { component, modalController };
  }

  it('selects and deselects the same style', () => {
    const { component } = page();
    component.selStyle(1, { id: 'C' });
    expect(component.filterItmClothing.style).toBe('C');
    expect(component.selectedFilterStyleIndex()).toBe(1);

    component.selStyle(1, { id: 'C' });
    expect(component.filterItmClothing.style).toBe('');
    expect(component.selectedFilterStyleIndex()).toBeNull();
  });

  it('selects and deselects the same season', () => {
    const { component } = page();
    component.selSeason(0, { id: 'E' });
    expect(component.filterItmClothing.season).toBe('E');
    expect(component.selectedFilterSeasonIndex()).toBe(0);

    component.selSeason(0, { id: 'E' });
    expect(component.filterItmClothing.season).toBe('');
    expect(component.selectedFilterSeasonIndex()).toBeNull();
  });

  it('dismisses selected filters as modal data', async () => {
    const { component, modalController } = page();
    component.filterItmClothing = {
      categories: [{ outfitCategory: 'M', outfitSubCategory: 'TS', color: 'N' }],
      season: 'E', style: 'C'
    };
    await component.saveSelecedFilter();
    expect(modalController.dismiss).toHaveBeenCalledWith(component.filterItmClothing, 'apply');
  });

  it('clears all filters and closes the modal', async () => {
    const { component, modalController } = page();
    await component.clearAllFilters();
    expect(component.filterItmClothing.season).toBe('');
    expect(component.filterItmClothing.style).toBe('');
    expect(modalController.dismiss).toHaveBeenCalledWith(null, 'clear');
  });

  it('accepts previous filters when reopened', () => {
    const { component } = page();
    component.currentFilterSel = { categories: [{ color: 'N' }], season: 'E', style: 'C' };
    expect(component.currentFilterSel).toEqual({ categories: [{ color: 'N' }], season: 'E', style: 'C' });
  });
});
