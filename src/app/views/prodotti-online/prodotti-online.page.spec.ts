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
    getData: jasmine.createSpy('getData'),
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
});
