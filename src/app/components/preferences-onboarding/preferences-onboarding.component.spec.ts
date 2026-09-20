import { of, Subject, throwError } from 'rxjs';
import { AppService } from 'src/app/service/app-service';
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

  function createComponent(
    gender: 'U' | 'D',
    getOutfitStyles = jasmine.createSpy('getOutfitStyles').and.returnValue(of(styles)),
    selectedStyles: string[] = [],
  ): PreferencesOnboardingComponent {
    const userService = {
      gUserProfile: () => () => ({ uid: 'user-id', gender }),
      gUserPreference: () => () => ({ style: selectedStyles, color: [], brend: [] }),
    } as unknown as UserService;
    const appService = { getOutfitStyles } as unknown as AppService;
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
});
