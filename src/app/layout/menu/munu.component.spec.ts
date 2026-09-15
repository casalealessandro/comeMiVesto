import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  AlertController,
  IonicModule,
  MenuController,
  ModalController,
  NavController
} from '@ionic/angular';

import { MenuComponent } from './menu.component';
import { UserService } from 'src/app/service/user.service';
import { UserProfile } from 'src/app/service/interface/user-interface';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj<UserService>(
      'UserService',
      ['gUserProfile', 'logOut', 'deleteAccount']
    );

    userServiceMock.gUserProfile.and.returnValue(
      signal<UserProfile | null>(null)
    );

    await TestBed.configureTestingModule({
      declarations: [MenuComponent],
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
          provide: AlertController,
          useValue: jasmine.createSpyObj('AlertController', ['create'])
        },
        {
          provide: MenuController,
          useValue: jasmine.createSpyObj('MenuController', ['close'])
        },
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['create'])
        },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['navigateRoot'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
