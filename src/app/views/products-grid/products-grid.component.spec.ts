import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CategoryService } from 'src/app/service/category.service';
import { ProductsGridComponent } from './products-grid.component';

describe('ProductsGridComponent', () => {
  let component: ProductsGridComponent;
  let fixture: ComponentFixture<ProductsGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProductsGridComponent],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            fetchCategory: jasmine.createSpy('fetchCategory').and.resolveTo('Categoria test')
          }
        }
      ]
    });

    TestBed.overrideComponent(ProductsGridComponent, {
      set: { template: '' }
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(ProductsGridComponent);
    component = fixture.componentInstance;
    component.products = [];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
