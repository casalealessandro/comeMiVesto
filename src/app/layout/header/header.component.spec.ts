import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { MenuController, ModalController, NavController } from '@ionic/angular';

import { SharedDataService } from 'src/app/service/shared-data.service';
import { UserService } from 'src/app/service/user.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: {
            gUserProfile: () => signal({ uid: 'test-user' } as any)
          }
        },
        {
          provide: SharedDataService,
          useValue: {
            data: signal<any[]>([]),
            staredData$: EMPTY
          }
        },
        {
          provide: ModalController,
          useValue: { getTop: jasmine.createSpy('getTop').and.resolveTo(null) }
        },
        {
          provide: NavController,
          useValue: { back: jasmine.createSpy('back') }
        },
        {
          provide: MenuController,
          useValue: {
            close: jasmine.createSpy('close'),
            open: jasmine.createSpy('open'),
            isOpen: jasmine.createSpy('isOpen').and.resolveTo(false)
          }
        }
      ]
    });

    TestBed.overrideComponent(HeaderComponent, {
      set: { template: '' }
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
