import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiRequestError, AppService } from './app-service';
import { outfit } from './interface/outfit-all-interface';
import { UserPreference } from './interface/user-interface';
import { UserService } from './user.service';

describe('UserService REST contracts', () => {
  let service: UserService;
  let http: HttpTestingController;
  let appService: jasmine.SpyObj<AppService>;

  beforeEach(() => {
    appService = jasmine.createSpyObj<AppService>('AppService', ['getOutfit', 'getUserOutfits', 'getWardrobes']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AngularFireAuth, useValue: { currentUser: { uid: 'user-id' } } },
        { provide: AngularFireStorage, useValue: {} },
        { provide: AppService, useValue: appService },
      ],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets the versioned terms status', async () => {
    const result = firstValueFrom(service.getTermsStatus());
    const request = http.expectOne(`${environment.BASE_API_URL}/user/terms-status`);
    expect(request.request.method).toBe('GET');
    request.flush({ message: 'Success', data: { accepted: false, acceptedVersion: null, currentVersion: '2' } });
    expect((await result).accepted).toBeFalse();
  });

  it('accepts terms with no extra fields', async () => {
    const result = firstValueFrom(service.acceptTerms());
    const request = http.expectOne(`${environment.BASE_API_URL}/user/accept-terms`);
    expect(request.request.body).toEqual({ accepted: true });
    request.flush({ message: 'Success', data: { accepted: true, acceptedVersion: '2', currentVersion: '2' } });
    expect((await result).accepted).toBeTrue();
  });

  it('returns the first user preference from the backend array', async () => {
    const preference: UserPreference = { uid: 'user-id', color: ['N'], brend: [], style: ['C'] };
    const result = service.getUserPreference();
    await Promise.resolve();
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/user-preferences`);
    request.flush({ message: 'Success', data: [preference] });
    expect(await result).toEqual(preference);
  });

  it('returns null for an empty user preference array', async () => {
    const result = service.getUserPreference();
    await Promise.resolve();
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/user-preferences`);
    request.flush({ message: 'Success', data: [] });
    expect(await result).toBeNull();
  });

  it('ignores a stale favorite while hydrating valid outfits', async () => {
    const validOutfit = { id: 'valid', title: 'Valid outfit' } as outfit;
    appService.getOutfit.and.callFake((id: string) => id === 'stale'
      ? Promise.reject(new ApiRequestError('Risorsa non trovata.', 404))
      : Promise.resolve(validOutfit));

    const result = firstValueFrom(service.loadFaveUserOutfits());
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/faveUserOutfits`);
    request.flush({ message: 'Success', data: [
      { id: 'favorite-stale', userId: 'user-id', outfitId: 'stale' },
      { id: 'favorite-valid', userId: 'user-id', outfitId: 'valid' },
    ] });

    expect(await result).toEqual([{ ...validOutfit, outfitId: 'valid', favoriteId: 'favorite-valid' }]);
  });
});
