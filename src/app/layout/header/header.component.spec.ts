import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  IonicModule,
  MenuController,
  ModalController,
  NavController
} from '@ionic/angular';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { UserService } from 'src/app/service/user.service';
import { SharedDataService } from 'src/app/service/shared-data.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const userServiceMock = {
    gUserProfile: jasmine.createSpy('gUserProfile').and.returnValue(
      signal({
        uid: 'test-user',
        displayName: '',
        cognome: '',
        name: '',
        email: '',
        password: '',
        photoURL: '',
        gender: '',
        createAt: 0
      })
    )
  };

  const sharedDataMock = {
    data: signal<any[]>([]),
    staredData$: of(null)
  };

  const modalControllerMock = jasmine.createSpyObj(
    'ModalController',
    ['getTop', 'dismiss']
  );

  const navControllerMock = jasmine.createSpyObj(
    'NavController',
    ['back']
  );

  const menuControllerMock = jasmine.createSpyObj(
    'MenuController',
    ['isOpen', 'open', 'close']
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [
        IonicModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: userServiceMock
        },
        {
          provide: SharedDataService,
          useValue: sharedDataMock
        },
        {
          provide: ModalController,
          useValue: modalControllerMock
        },
        {
          provide: NavController,
          useValue: navControllerMock
        },
        {
          provide: MenuController,
          useValue: menuControllerMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
