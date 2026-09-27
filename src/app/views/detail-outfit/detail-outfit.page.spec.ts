import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import {
  IonicModule,
  ModalController,
  NavController
} from '@ionic/angular';
import { BehaviorSubject, of } from 'rxjs';

import { DetailOutfitPage } from './detail-outfit.page';
import { AppService } from 'src/app/service/app-service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { SharedDataService } from 'src/app/service/shared-data.service';

describe('DetailOutfitPage', () => {
  let component: DetailOutfitPage;
  let fixture: ComponentFixture<DetailOutfitPage>;
  const paramMap = new BehaviorSubject(convertToParamMap({}));

  const modalControllerMock = jasmine.createSpyObj(
    'ModalController',
    ['getTop', 'dismiss']
  );

  const navControllerMock = jasmine.createSpyObj(
    'NavController',
    ['back']
  );

  const appServiceMock = {
    getOutfit: jasmine.createSpy('getOutfit'),
    filterOutfitProducts: jasmine.createSpy('filterOutfitProducts'),
    createWardrobe: jasmine.createSpy('createWardrobe'),
    selectedProduct: {
      set: jasmine.createSpy('set')
    }
  };

  const firebaseServiceMock = {
    authState: of(null)
  };

  const sharedDataMock = {
    setData: jasmine.createSpy('setData')
  };

  beforeEach(async () => {
    paramMap.next(convertToParamMap({}));
    appServiceMock.getOutfit.calls.reset();
    appServiceMock.filterOutfitProducts.calls.reset();
    appServiceMock.createWardrobe.calls.reset();
    await TestBed.configureTestingModule({
      declarations: [DetailOutfitPage],
      imports: [
        IonicModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap } },
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
          provide: SharedDataService,
          useValue: sharedDataMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailOutfitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses response data, sends gender and keeps tagged products excluded', async () => {
    component.tags = [{ id: 'tagged' } as any];
    appServiceMock.getOutfit.and.resolveTo({
      imageUrl: 'outfit.jpg',
      tags: component.tags,
      outfitSubCategory: ['subcategory'],
      gender: 'U'
    });
    appServiceMock.filterOutfitProducts.and.resolveTo({
      data: [{ id: 'tagged' }, { id: 'related' }],
      pagination: { nextCursor: null, hasMore: false }
    });

    paramMap.next(convertToParamMap({ id: 'outfit-1' }));
    await fixture.whenStable();

    expect(appServiceMock.filterOutfitProducts).toHaveBeenCalledWith({
      outfitSubCategory: ['subcategory'],
      gender: 'U',
      limit: 20
    });
    expect(component.relatedProducts.map(product => product.id)).toEqual(['related']);
  });

  it('keeps wardrobe saving compatible with catalog prezzo', async () => {
    appServiceMock.createWardrobe.and.resolveTo({ id: 'saved' });
    spyOn(window, 'alert');

    await component.saveItem({ data: {
      brend: 'Brand', images: ['image'], imageUrl: 'image', name: 'Product',
      outfitCategory: 'category', outfitSubCategory: 'subcategory', color: 'black',
      price: 10, prezzo: 9.99, link: 'https://example.com'
    } });

    expect(appServiceMock.createWardrobe).toHaveBeenCalledWith(jasmine.objectContaining({ prezzo: 9.99 }));
  });
});
