import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { environment } from 'src/environments/environment';
import { ApiRequestError, AppService } from './app-service';

describe('AppService REST contracts', () => {
  let service: AppService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AngularFireStorage, useValue: {} }],
    });
    service = TestBed.inject(AppService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

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

  it('blocks a user through the dedicated endpoint', async () => {
    const result = service.blockUser('blocked/user');
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/blocked-users/blocked%2Fuser`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ message: 'Success', data: { id: 'block-id', blockedUserId: 'blocked/user', createdAt: 1 } });
    await result;
  });
});
