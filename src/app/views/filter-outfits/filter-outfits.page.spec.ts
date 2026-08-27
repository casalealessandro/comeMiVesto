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

  it('selects season and style', () => {
    const { component } = page();
    component.selSeason(0, { id: 'E' });
    component.selStyle(1, { id: 'C' });
    expect(component.filterItmClothing.season).toBe('E');
    expect(component.filterItmClothing.style).toBe('C');
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
