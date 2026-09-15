import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  IonicModule,
  ModalController,
  NavController
} from '@ionic/angular';
import { of } from 'rxjs';

import { DetailOutfitPage } from './detail-outfit.page';
import { AppService } from 'src/app/service/app-service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { SharedDataService } from 'src/app/service/shared-data.service';

describe('DetailOutfitPage', () => {
  let component: DetailOutfitPage;
  let fixture: ComponentFixture<DetailOutfitPage>;

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
    await TestBed.configureTestingModule({
      declarations: [DetailOutfitPage],
      imports: [
        IonicModule.forRoot()
      ],
      providers: [
        provideRouter([]),
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
});
