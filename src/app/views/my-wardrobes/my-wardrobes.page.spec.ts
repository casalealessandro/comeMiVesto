import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { of } from 'rxjs';

import { MyWardrobesPage } from './my-wardrobes.page';
import { AppService } from 'src/app/service/app-service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { UserService } from 'src/app/service/user.service';

describe('MyWardrobesPage', () => {
  let component: MyWardrobesPage;
  let fixture: ComponentFixture<MyWardrobesPage>;

  const appServiceMock = {
    resultsSignal: signal<any[]>([]),
    getData: jasmine.createSpy('getData'),
    deleteWardrobe: jasmine.createSpy('deleteWardrobe'),
    createWardrobe: jasmine.createSpy('createWardrobe')
  };

  const firebaseServiceMock = {
    authState: of(null)
  };

  const userServiceMock = {
    getUserWardrobes: jasmine.createSpy('getUserWardrobes')
      .and.returnValue(of([]))
  };

  const modalControllerMock = jasmine.createSpyObj(
    'ModalController',
    ['getTop', 'create', 'dismiss']
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MyWardrobesPage],
      imports: [
        IonicModule.forRoot()
      ],
      providers: [
        provideRouter([]),
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
          provide: ModalController,
          useValue: modalControllerMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyWardrobesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
