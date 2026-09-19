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

  beforeEach(async () => {
    appServiceMock.getOutfitProducts.calls.reset();
    appServiceMock.filterOutfitProducts.calls.reset();
    appServiceMock.createWardrobe.calls.reset();
    appServiceMock.getOutfitProducts.and.resolveTo({ data: [], pagination: { nextCursor: null, hasMore: false } });
    appServiceMock.filterOutfitProducts.and.resolveTo({ data: [], pagination: { nextCursor: null, hasMore: false } });
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

  it('replaces the first page and sends gender to the backend', async () => {
    component.gender = 'D';
    appServiceMock.getOutfitProducts.and.resolveTo({
      data: [{ id: 'first' }],
      pagination: { nextCursor: 'cursor-1', hasMore: true }
    });

    await component.loadProducts();

    expect(component.products.map(product => product.id)).toEqual(['first']);
    expect(component.nextCursor).toBe('cursor-1');
    expect(appServiceMock.getOutfitProducts).toHaveBeenCalledWith({ gender: 'D', limit: 20 });
  });

  it('appends a page, passes its cursor and removes duplicate ids', async () => {
    component.products = [{ id: 'first' } as any];
    component.nextCursor = 'cursor-1';
    component.hasMore = true;
    appServiceMock.getOutfitProducts.and.resolveTo({
      data: [{ id: 'first' }, { id: 'second' }],
      pagination: { nextCursor: null, hasMore: false }
    });

    await component.loadProducts('', '', true);

    expect(appServiceMock.getOutfitProducts).toHaveBeenCalledWith({ limit: 20, cursor: 'cursor-1' });
    expect(component.products.map(product => product.id)).toEqual(['first', 'second']);
    expect(component.hasMore).toBeFalse();
  });

  it('does not request another page when hasMore is false', async () => {
    component.hasMore = false;
    await component.loadProducts('', '', true);
    expect(appServiceMock.getOutfitProducts).not.toHaveBeenCalled();
  });

  it('always completes and disables ionInfinite after the final page', async () => {
    component.hasMore = true;
    appServiceMock.getOutfitProducts.and.resolveTo({ data: [], pagination: { nextCursor: null, hasMore: false } });
    const target = { complete: jasmine.createSpy('complete').and.resolveTo(), disabled: false };

    await component.loadMoreProducts({ target } as any);

    expect(target.complete).toHaveBeenCalled();
    expect(target.disabled).toBeTrue();
  });

  it('completes ionInfinite even when loading fails', async () => {
    appServiceMock.getOutfitProducts.and.rejectWith(new Error('network'));
    const target = { complete: jasmine.createSpy('complete').and.resolveTo(), disabled: false };

    await expectAsync(component.loadMoreProducts({ target } as any)).toBeRejected();

    expect(target.complete).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  });

  it('resets products and cursor and reenables infinite scroll on category change', async () => {
    component.products = [{ id: 'old' } as any];
    component.nextCursor = 'old-cursor';
    component.hasMore = false;
    component.infiniteScroll = { disabled: true } as any;

    await component.filterCategory(0, { id: 'category-1', categoryName: 'Categoria' } as any);

    expect(component.outfitCategory).toBe('category-1');
    expect(component.nextCursor).toBeNull();
    expect(component.products).toEqual([]);
    expect(component.infiniteScroll?.disabled).toBeFalse();
    expect(appServiceMock.filterOutfitProducts).toHaveBeenCalledWith({
      outfitCategory: ['category-1'],
      limit: 20
    });
  });

  it('keeps wardrobe saving compatible with catalog prezzo', async () => {
    appServiceMock.createWardrobe.and.resolveTo({ id: 'saved' });
    spyOn(window, 'alert');

    await component.saveToWardrobe({ data: {
      brend: 'Brand', images: ['image'], imageUrl: 'image', name: 'Product',
      outfitCategory: 'category', outfitSubCategory: 'subcategory', color: 'black',
      price: 10, prezzo: 9.99, link: 'https://example.com'
    } });

    expect(appServiceMock.createWardrobe).toHaveBeenCalledWith(jasmine.objectContaining({ prezzo: 9.99 }));
  });
});
