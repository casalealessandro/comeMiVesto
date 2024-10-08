import { TestBed } from '@angular/core/testing';

import { ProdottiOnlineService } from './prodotti-online.service';

describe('ProdottiOnlineService', () => {
  let service: ProdottiOnlineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdottiOnlineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
