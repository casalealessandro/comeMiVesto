import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import {
  IonicModule,
  ModalController,
  NavController
} from '@ionic/angular';
import { of, BehaviorSubject } from 'rxjs';

import { ProdottiOnlinePage } from './prodotti-online.page';
import { AppService } from 'src/app/service/app-service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { UserService } from 'src/app/service/user.service';
import { CategoryService } from 'src/app/service/category.service';
import { AppCatalogProduct } from 'src/app/service/interface/outfit-all-interface';

describe('ProdottiOnlinePage', () => {
  let component: ProdottiOnlinePage;
  let fixture: ComponentFixture<ProdottiOnlinePage>;

  const modalControllerMock = jasmine.createSpyObj(
    'ModalController',
    ['getTop', 'dismiss']
  );

  modalControllerMock.getTop.and.resolveTo(null);

  const navControllerMock = jasmine.createSpyObj(
    'NavController',
    ['back']
  );

  const appServiceMock = {
    getOutfitProducts: jasmine.createSpy('getOutfitProducts'),
    filterOutfitProducts: jasmine.createSpy('filterOutfitProducts'),
    createWardrobe: jasmine.createSpy('createWardrobe')
  };

  const firebaseServiceMock = {
    authState: of(null)
  };

  const userServiceMock = {
    gUserProfile: jasmine.createSpy('gUserProfile').and.returnValue(
      signal(null)
    )
  };

  const categoryServiceMock = {
    categoriesSubject: new BehaviorSubject<any[]>([]),
    categoriesByParent: jasmine.createSpy('categoriesByParent')
  };

  const product = (id: string): AppCatalogProduct => ({
    id,
    name: `Product ${id}`,
    brand: 'Brand',
    brend: 'Brand',
    outfitCategory: 'TOP',
    outfitSubCategory: 'JACKET',
    color: 'BLACK',
    genderTargets: ['U'],
    images: [`https://example.com/${id}.jpg`],
    imageUrl: `https://example.com/${id}.jpg`,
    price: 49.9,
    prezzo: 49.9,
    currency: 'EUR',
    link: `https://shop.example/${id}`,
    affiliateProgramId: 'program-1'
  });

  beforeEach(async () => {
    appServiceMock.getOutfitProducts.calls.reset();
    appServiceMock.filterOutfitProducts.calls.reset();
    appServiceMock.createWardrobe.calls.reset();

    await TestBed.configureTestingModule({
      declarations: [ProdottiOnlinePage],
      imports: [
        IonicModule.forRoot()
      ],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerMock
        },
        {
          provide: NavController,
          useValue: navControllerMock
        },
        {
          provide: AppService,
          useValue: appServiceMock
        },
        {
          provide: FirebaseService,
          useValue: firebaseServiceMock
        },
        {
          provide: UserService,
          useValue: userServiceMock
        },
        {
          provide: CategoryService,
          useValue: categoryServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProdottiOnlinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the first catalog page with gender and replaces products', async () => {
    component.gender = 'U';
    component.products = [product('old')];
    appServiceMock.getOutfitProducts.and.resolveTo({
      data: [product('one')],
      pagination: { nextCursor: 'one', hasMore: true }
    });

    await component.loadProducts();

    expect(appServiceMock.getOutfitProducts).toHaveBeenCalledWith({
      gender: 'U',
      limit: 20
    });
    expect(component.products.map(item => item.id)).toEqual(['one']);
    expect(component.nextCursor).toBe('one');
    expect(component.hasMore).toBeTrue();
  });

  it('uses the cursor and appends products from Ionic infinite scroll', async () => {
    component.gender = 'U';
    component.products = [product('one')];
    component.nextCursor = 'one';
    component.hasMore = true;
    appServiceMock.getOutfitProducts.and.resolveTo({
      data: [product('two')],
      pagination: { nextCursor: null, hasMore: false }
    });

    const target = {
      complete: jasmine.createSpy('complete').and.resolveTo(),
      disabled: false
    };

    await component.loadMoreProducts({ target } as any);

    expect(appServiceMock.getOutfitProducts).toHaveBeenCalledWith({
      gender: 'U',
      limit: 20,
      cursor: 'one'
    });
    expect(component.products.map(item => item.id)).toEqual(['one', 'two']);
    expect(component.hasMore).toBeFalse();
    expect(target.complete).toHaveBeenCalled();
    expect(target.disabled).toBeTrue();
  });

  it('does not request another page when hasMore is false', async () => {
    component.hasMore = false;
    const target = {
      complete: jasmine.createSpy('complete').and.resolveTo(),
      disabled: false
    };

    await component.loadMoreProducts({ target } as any);

    expect(appServiceMock.getOutfitProducts).not.toHaveBeenCalled();
    expect(target.complete).toHaveBeenCalled();
    expect(target.disabled).toBeTrue();
  });

  it('resets pagination and uses server-side category filters', async () => {
    component.gender = 'D';
    component.products = [product('old')];
    component.nextCursor = 'old';
    component.hasMore = false;
    appServiceMock.filterOutfitProducts.and.resolveTo({
      data: [product('filtered')],
      pagination: { nextCursor: null, hasMore: false }
    });
    categoryServiceMock.categoriesByParent.and.resolveTo([]);

    await component.filterCategory(0, {
      id: 'TOP',
      categoryName: 'Top',
      parentCategory: null,
      status: true,
      order: 1,
      gender: ['D'],
      createdAt: 1
    });

    expect(appServiceMock.filterOutfitProducts).toHaveBeenCalledWith({
      outfitCategory: ['TOP'],
      gender: 'D',
      limit: 20
    });
    expect(component.products.map(item => item.id)).toEqual(['filtered']);
    expect(component.nextCursor).toBeNull();
  });
});
