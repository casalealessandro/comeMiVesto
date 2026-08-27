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
    const result = service.createReport({ outFitId: 'outfit-id', outfitUserId: 'author-id', typeSegnaletion: 'type' });
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/reports`);
    request.flush({ message: 'Duplicate report' }, { status: 409, statusText: 'Conflict' });

    await expectAsync(result).toBeRejectedWith(jasmine.objectContaining<ApiRequestError>({ status: 409 }));
  });
});
