import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlertController, MenuController, ModalController, NavController } from '@ionic/angular';

import { UserService } from 'src/app/service/user.service';
import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MenuComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: {
            gUserProfile: () => signal({
              uid: 'test-user',
              name: '',
              cognome: '',
              displayName: '',
              photoURL: ''
            } as any),
            logOut: jasmine.createSpy('logOut'),
            deleteAccount: jasmine.createSpy('deleteAccount')
          }
        },
        {
          provide: AlertController,
          useValue: { create: jasmine.createSpy('create') }
        },
        {
          provide: MenuController,
          useValue: {
            close: jasmine.createSpy('close'),
            open: jasmine.createSpy('open'),
            isOpen: jasmine.createSpy('isOpen').and.resolveTo(false)
          }
        },
        {
          provide: NavController,
          useValue: { back: jasmine.createSpy('back') }
        },
        {
          provide: ModalController,
          useValue: {
            create: jasmine.createSpy('create'),
            dismiss: jasmine.createSpy('dismiss'),
            getTop: jasmine.createSpy('getTop').and.resolveTo(null)
          }
        }
      ]
    });

    TestBed.overrideComponent(MenuComponent, {
      set: { template: '' }
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
