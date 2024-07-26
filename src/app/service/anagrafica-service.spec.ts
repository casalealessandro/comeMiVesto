import { TestBed } from '@angular/core/testing';

import { AnagraficaService } from './anagrafica-service';

describe('AnagraficaServiceService', () => {
  let service: AnagraficaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnagraficaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
