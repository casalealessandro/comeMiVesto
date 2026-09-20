import { of, Subject, throwError } from 'rxjs';
import { AppService, OutfitBrand, OutfitColor } from 'src/app/service/app-service';
import { OutfitStyle } from 'src/app/service/interface/outfit-style-interface';
import { UserService } from 'src/app/service/user.service';
import { PreferencesOnboardingComponent } from './preferences-onboarding.component';

describe('PreferencesOnboardingComponent dynamic styles', () => {
  const styles: OutfitStyle[] = [
    {
      id: 'shared',
      value: 'Condiviso',
      parent: null,
      order: 1,
      gender: ['U', 'D'],
      images: {
        U: { imageBase64: 'u-image', imageMimeType: 'image/png', imageFileName: 'u.png' },
        D: { imageBase64: 'd-image', imageMimeType: 'image/jpeg', imageFileName: 'd.jpg' },
      },
    },
    { id: 'u-only', value: 'Uomo', parent: null, order: 2, gender: ['U'], images: {} },
    { id: 'd-only', value: 'Donna', parent: null, order: 3, gender: ['D'], images: {} },
  ];

  const colors: OutfitColor[] = [
    { id: 'N', value: 'Nero', parent: null, hex: '#000000' },
    { id: 'B', value: 'Bianco', parent: null, hex: '#FFFFFF' },
  ];

  const brands: OutfitBrand[] = [
    { id: 'Armani', value: 'Armani', parent: null },
    { id: 'Gucci', value: 'Gucci', parent: null },
  ];

  function createComponent(
    gender: 'U' | 'D',
    getOutfitStyles = jasmine.createSpy('getOutfitStyles').and.returnValue(of(styles)),
    selectedStyles: string[] = [],
  ): PreferencesOnboardingComponent {
    const userService = {
      gUserProfile: () => () => ({ uid: 'user-id', gender }),
      gUserPreference: () => () => ({ style: selectedStyles, color: [], brend: [] }),
    } as unknown as UserService;
    const appService = {
      getOutfitStyles,
      getOutfitColors: () => of(colors),
      getOutfitBrands: () => of(brands),
    } as unknown as AppService;
    return new PreferencesOnboardingComponent(userService, appService, {} as never, {} as never);
  }

  it('loads styles during initialization and exposes loading state', () => {
    const response = new Subject<OutfitStyle[]>();
    const getOutfitStyles = jasmine.createSpy('getOutfitStyles').and.returnValue(response);
    const component = createComponent('U', getOutfitStyles);

    component.ngOnInit();
    expect(getOutfitStyles).toHaveBeenCalledOnceWith();
    expect(component.stylesLoading).toBeTrue();

    response.next(styles);
    response.complete();
    expect(component.stylesLoading).toBeFalse();
  });

  it('shows only styles compatible with gender U', () => {
    const component = createComponent('U');
    component.ngOnInit();
    expect(component.styleOptions.map(style => style.id)).toEqual(['shared', 'u-only']);
  });

  it('shows only styles compatible with gender D', () => {
    const component = createComponent('D');
    component.ngOnInit();
    expect(component.styleOptions.map(style => style.id)).toEqual(['shared', 'd-only']);
  });

  it('uses the image for the current gender', () => {
    const maleComponent = createComponent('U');
    const femaleComponent = createComponent('D');
    maleComponent.ngOnInit();
    femaleComponent.ngOnInit();

    expect(maleComponent.getStyleImage(styles[0])).toBe('data:image/png;base64,u-image');
    expect(femaleComponent.getStyleImage(styles[0])).toBe('data:image/jpeg;base64,d-image');
  });

  it('returns no image when the current gender image is missing', () => {
    const component = createComponent('U');
    component.ngOnInit();
    expect(component.getStyleImage(styles[2])).toBeNull();
  });

  it('handles an API error without removing existing selections', () => {
    const getOutfitStyles = jasmine.createSpy('getOutfitStyles').and.returnValue(
      throwError(() => new Error('Unavailable')),
    );
    const component = createComponent('U', getOutfitStyles, ['saved-style']);

    component.ngOnInit();

    expect(component.stylesLoadError).toBeTrue();
    expect(component.stylesLoading).toBeFalse();
    expect(component.styleOptions).toEqual([]);
    expect(component.selectedStyles.has('saved-style')).toBeTrue();
  });

  it('loads colors and brands from the backend taxonomies', () => {
    const component = createComponent('U');

    component.ngOnInit();

    expect(component.colorOptions).toEqual(colors);
    expect(component.brandOptions).toEqual(brands);
    expect(component.colorsLoadError).toBeFalse();
    expect(component.brandsLoadError).toBeFalse();
  });
});

describe('PreferencesOnboardingComponent brand search', () => {
  function createComponent(): PreferencesOnboardingComponent {
    const userService = {
      gUserProfile: () => () => ({ uid: 'user-id', gender: 'U' }),
      gUserPreference: () => () => ({ style: [], color: [], brend: [] }),
    } as unknown as UserService;
    const appService = {
      getOutfitStyles: () => of([]),
      getOutfitColors: () => of([]),
      getOutfitBrands: () => of([]),
    } as unknown as AppService;
    const component = new PreferencesOnboardingComponent(userService, appService, {} as never, {} as never);
    component.brandOptions = [
      { id: 'A', value: 'Armani', parent: null },
      { id: 'G', value: 'Gucci', parent: null },
      { id: 'MK', value: 'Michael Kors', parent: null },
    ];
    return component;
  }

  it('filters brands by value while the search text changes', () => {
    const component = createComponent();

    component.brandSearchQuery = 'Kors';

    expect(component.filteredBrandOptions.map(brand => brand.id)).toEqual(['MK']);
  });

  it('filters brands case-insensitively', () => {
    const component = createComponent();

    component.brandSearchQuery = 'gUcCi';

    expect(component.filteredBrandOptions.map(brand => brand.id)).toEqual(['G']);
  });

  it('shows all brands again when the search is reset', () => {
    const component = createComponent();
    component.brandSearchQuery = 'Armani';
    expect(component.filteredBrandOptions.length).toBe(1);

    component.brandSearchQuery = '';

    expect(component.filteredBrandOptions).toBe(component.brandOptions);
  });

  it('returns no brands when the search has no results', () => {
    const component = createComponent();

    component.brandSearchQuery = 'Nike';

    expect(component.filteredBrandOptions).toEqual([]);
  });

  it('keeps a selected brand while it is hidden and shown again', () => {
    const component = createComponent();
    component.toggleBrand('A');

    component.brandSearchQuery = 'Gucci';
    expect(component.filteredBrandOptions.map(brand => brand.id)).toEqual(['G']);
    expect(component.selectedBrands.has('A')).toBeTrue();

    component.brandSearchQuery = '';
    const selectedBrand = component.filteredBrandOptions.find(brand => brand.id === 'A');
    expect(selectedBrand).toBeDefined();
    expect(component.isSelected(component.selectedBrands, selectedBrand!.id)).toBeTrue();
  });
});
