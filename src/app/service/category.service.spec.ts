import { TestBed } from '@angular/core/testing';

import { AppService } from './app-service';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppService,
          useValue: {
            getData: jasmine.createSpy('getData')
          }
        }
      ]
    });

    service = TestBed.inject(CategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
