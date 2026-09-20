import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiRequestError, AppService, OutfitBrand, OutfitColor } from './app-service';
import { FirebaseService } from './firebase.service';
import { OutfitStyle } from './interface/outfit-style-interface';

describe('AppService REST contracts', () => {
  let service: AppService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: FirebaseService, useValue: { storage: {} } }],
    });
    service = TestBed.inject(AppService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets outfit styles from the dedicated endpoint when backend returns the raw array', async () => {
    const styles: OutfitStyle[] = [{
      id: 'casual',
      value: 'Casual',
      parent: null,
      order: 1,
      gender: ['U', 'D'],
      images: {},
    }];
    const result = firstValueFrom(service.getOutfitStyles());
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/outfitStyles`);

    expect(request.request.method).toBe('GET');
    request.flush(styles);
    await expectAsync(result).toBeResolvedTo(styles);
  });

  it('also accepts the standard API response wrapper for outfit styles', async () => {
    const styles: OutfitStyle[] = [{
      id: 'business',
      value: 'Business',
      parent: null,
      order: 2,
      gender: ['U', 'D'],
      images: {},
    }];
    const result = firstValueFrom(service.getOutfitStyles());
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/outfitStyles`);

    request.flush({ message: 'Success', data: styles });
    await expectAsync(result).toBeResolvedTo(styles);
  });

  it('gets colors from the Firestore taxonomy endpoint', async () => {
    const colors: OutfitColor[] = [{
      id: 'N',
      value: 'Nero',
      parent: null,
      hex: '#000000',
    }];
    const result = firstValueFrom(service.getOutfitColors());
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/outfitColors`);

    expect(request.request.method).toBe('GET');
    request.flush(colors);
    await expectAsync(result).toBeResolvedTo(colors);
  });

  it('gets brands from the catalog taxonomy endpoint', async () => {
    const brands: OutfitBrand[] = [{
      id: 'Zara',
      value: 'Zara',
      parent: null,
    }];
    const result = firstValueFrom(service.getOutfitBrands());
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/outfitBrands`);

    expect(request.request.method).toBe('GET');
    request.flush({ message: 'Success', data: brands });
    await expectAsync(result).toBeResolvedTo(brands);
  });

  it('keeps categories with any meaningful field and removes empty/UI-only fields', () => {
    service.getFilteredOutfits('gender=U', {
      categories: [
        { color: 'N' },
        { outfitSubCategory: 'TS' },
        { outfitCategory: 'M' },
        { outfitCategory: 'S', color: 'B' },
        {},
      ],
      season: 'E',
      style: 'C',
    }).subscribe();

    const request = http.expectOne(`${environment.BASE_API_URL}/gen/filter-outfits?gender=U`);
    expect(request.request.body).toEqual({
      categories: [
        { color: 'N' },
        { outfitSubCategory: 'TS' },
        { outfitCategory: 'M' },
        { outfitCategory: 'S', color: 'B' },
      ],
      season: 'E',
      style: 'C',
    });
    request.flush({ message: 'Success', data: [] });
  });

  it('keeps catalogProductId when filtering outfits by an exact catalog product', () => {
    service.getFilteredOutfits('gender=U', {
      categories: [],
      season: '',
      style: '',
      catalogProductId: 'catalog-1'
    }).subscribe();

    const request = http.expectOne(`${environment.BASE_API_URL}/gen/filter-outfits?gender=U`);
    expect(request.request.body).toEqual({
      categories: [],
      season: '',
      style: '',
      catalogProductId: 'catalog-1'
    });
    request.flush({ message: 'Success', data: [] });
  });

    it('does not add images to a name-only wardrobe update', async () => {
    const result = service.updateWardrobe('wardrobe-id', { name: 'Nuovo nome' });
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/wardrobes/wardrobe-id`);
    expect(request.request.body).toEqual({ name: 'Nuovo nome' });
    request.flush({ message: 'Success', data: { id: 'wardrobe-id', name: 'Nuovo nome' } });
    await result;
  });

  it('preserves the status of a report conflict', async () => {
    const result = service.createReport({ outFitId: 'outfit-id', typeSegnaletion: 'segnalaContenuto', reason: 'spam' });
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/reports`);
    request.flush({ message: 'Duplicate report' }, { status: 409, statusText: 'Conflict' });

    await expectAsync(result).toBeRejectedWith(jasmine.objectContaining<ApiRequestError>({ status: 409 }));
  });

  it('sends only the supported report fields', async () => {
    const result = service.createReport({ outFitId: 'outfit-id', typeSegnaletion: 'segnalaUtente', reason: 'odioMolestie' });
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/reports`);
    expect(request.request.body).toEqual({ outFitId: 'outfit-id', typeSegnaletion: 'segnalaUtente', reason: 'odioMolestie' });
    request.flush({ message: 'Success', data: {} });
    await result;
  });

  it('gets public user outfits without using authenticated user state', async () => {
    const result = firstValueFrom(service.getPublicUserOutfits('user/id'));
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/public-user-outfits/user%2Fid`);
    expect(request.request.method).toBe('GET');
    request.flush({ message: 'Success', data: [{ id: 'outfit-id' }] });
    expect((await result)[0].id).toBe('outfit-id');
  });

  it('blocks a user through the dedicated endpoint', async () => {
    const result = service.blockUser('blocked/user');
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/blocked-users/blocked%2Fuser`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ message: 'Success', data: { id: 'block-id', blockedUserId: 'blocked/user', createdAt: 1 } });
    await result;
  });

  it('gets catalog products with gender, limit and cursor and preserves pagination', async () => {
    const result = service.getOutfitProducts({ gender: 'D', limit: 20, cursor: 'next-page' });
    const request = http.expectOne(req => req.url === `${environment.BASE_API_URL}/gen/outfit-products`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('gender')).toBe('D');
    expect(request.request.params.get('limit')).toBe('20');
    expect(request.request.params.get('cursor')).toBe('next-page');
    request.flush({ data: [{ id: 'product-1' }], pagination: { nextCursor: 'product-1', hasMore: true } });

    await expectAsync(result).toBeResolvedTo(jasmine.objectContaining({
      data: [jasmine.objectContaining({ id: 'product-1' })],
      pagination: { nextCursor: 'product-1', hasMore: true }
    }));
  });

  it('posts catalog filters and returns data with pagination', async () => {
    const filters = {
      outfitCategory: ['category-1'],
      color: ['N'],
      brend: ['Z'],
      gender: 'U',
      limit: 20,
      cursor: 'next-page'
    };
    const result = service.filterOutfitProducts(filters);
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/filter-outfit-products`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(filters);
    request.flush({ data: [], pagination: { nextCursor: null, hasMore: false } });

    await expectAsync(result).toBeResolvedTo({
      data: [],
      pagination: { nextCursor: null, hasMore: false }
    });
  });
});
