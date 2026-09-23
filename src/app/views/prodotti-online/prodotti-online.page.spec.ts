import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import {
  IonicModule,
  ModalController,
  NavController,
  ToastController
} from '@ionic/angular';
import { of, BehaviorSubject } from 'rxjs';

import { ProdottiOnlinePage } from './prodotti-online.page';
import { ApiRequestError, AppService } from 'src/app/service/app-service';
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

  const toast = { present: jasmine.createSpy('present').and.resolveTo() };
  const toastControllerMock = jasmine.createSpyObj('ToastController', ['create']);

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
    modalControllerMock.dismiss.calls.reset();
    toast.present.calls.reset();
    toastControllerMock.create.calls.reset();
    toastControllerMock.create.and.resolveTo(toast as any);
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
        },
        {
          provide: ToastController,
          useValue: toastControllerMock
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

  it('keeps the latest category when an older product request finishes later', async () => {
    let resolveOldRequest!: (value: any) => void;
    appServiceMock.getOutfitProducts.and.returnValue(new Promise(resolve => {
      resolveOldRequest = resolve;
    }));
    appServiceMock.filterOutfitProducts.and.resolveTo({
      data: [{ id: 'filtered' }],
      pagination: { nextCursor: 'filtered-cursor', hasMore: true }
    });
    categoryServiceMock.categoriesByParent.and.resolveTo([]);

    const oldLoad = component.loadProducts();
    await component.filterCategory(0, { id: 'category-1', categoryName: 'Categoria' } as any);

    resolveOldRequest({
      data: [{ id: 'stale' }],
      pagination: { nextCursor: 'stale-cursor', hasMore: true }
    });
    await oldLoad;

    expect(component.products.map(product => product.id)).toEqual(['filtered']);
    expect(component.nextCursor).toBe('filtered-cursor');
    expect(component.outfitCategory).toBe('category-1');
  });

  const productEvent = (id = 'PRODUCT_123') => ({ data: {
    id, brend: 'Brand', images: ['image'], imageUrl: 'image', name: 'Product',
    outfitCategory: 'category', outfitSubCategory: 'subcategory', color: 'black',
    price: 10, prezzo: 9.99, link: 'https://example.com'
  } });

  it('saves once and dismisses selection mode with the created wardrobe item', async () => {
    const createdWardrobeItem = { id: 'saved' };
    component.showHeader = true;
    appServiceMock.createWardrobe.and.resolveTo(createdWardrobeItem);

    await component.saveToWardrobe(productEvent());

    expect(appServiceMock.createWardrobe).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ catalogProductId: 'PRODUCT_123', prezzo: 9.99 })
    );
    expect(modalControllerMock.dismiss).toHaveBeenCalledOnceWith(createdWardrobeItem, 'selected');
  });

  it('keeps the modal open and shows a specific message for a duplicate', async () => {
    component.showHeader = true;
    appServiceMock.createWardrobe.and.rejectWith(
      new ApiRequestError('La risorsa è già presente.', 409, 'WARDROBE_PRODUCT_ALREADY_EXISTS')
    );

    await component.saveToWardrobe(productEvent());

    expect(appServiceMock.createWardrobe).toHaveBeenCalledTimes(1);
    expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    expect(toastControllerMock.create).toHaveBeenCalledWith(jasmine.objectContaining({
      message: 'Questo prodotto è già presente nel tuo armadio.'
    }));
  });

  it('ignores a second tap while the same catalog product is being saved', async () => {
    let resolveSave!: (value: any) => void;
    appServiceMock.createWardrobe.and.returnValue(new Promise(resolve => resolveSave = resolve));

    const firstSave = component.saveToWardrobe(productEvent());
    await component.saveToWardrobe(productEvent());
    expect(appServiceMock.createWardrobe).toHaveBeenCalledTimes(1);

    resolveSave({ id: 'saved' });
    await firstSave;
  });

  it('handles generic errors and clears the saving state', async () => {
    appServiceMock.createWardrobe.and.rejectWith(new ApiRequestError('Riprova più tardi.', 500));

    await component.saveToWardrobe(productEvent());
    await component.saveToWardrobe(productEvent());

    expect(appServiceMock.createWardrobe).toHaveBeenCalledTimes(2);
    expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    expect(toastControllerMock.create).toHaveBeenCalledWith(jasmine.objectContaining({ message: 'Riprova più tardi.' }));
  });

  it('saves from the normal products page without dismissing a modal', async () => {
    component.showHeader = false;
    appServiceMock.createWardrobe.and.resolveTo({ id: 'saved' });

    await component.saveToWardrobe(productEvent());

    expect(appServiceMock.createWardrobe).toHaveBeenCalledTimes(1);
    expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    expect(toastControllerMock.create).toHaveBeenCalledWith(jasmine.objectContaining({
      message: 'Prodotto aggiunto al tuo armadio.'
    }));
  });
});
