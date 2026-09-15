import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { ModalController } from '@ionic/angular';

import { AppService } from 'src/app/service/app-service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { UserService } from 'src/app/service/user.service';
import { MyWardrobesPage } from './my-wardrobes.page';

describe('MyWardrobesPage', () => {
  let component: MyWardrobesPage;
  let fixture: ComponentFixture<MyWardrobesPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MyWardrobesPage],
      providers: [
        provideRouter([]),
        {
          provide: AppService,
          useValue: {
            resultsSignal: signal<any[]>([]),
            getData: jasmine.createSpy('getData').and.resolveTo([]),
            deleteWardrobe: jasmine.createSpy('deleteWardrobe'),
            createWardrobe: jasmine.createSpy('createWardrobe')
          }
        },
        {
          provide: FirebaseService,
          useValue: { authState: EMPTY }
        },
        {
          provide: UserService,
          useValue: {
            getUserWardrobes: jasmine.createSpy('getUserWardrobes').and.returnValue(of([]))
          }
        },
        {
          provide: ModalController,
          useValue: {
            create: jasmine.createSpy('create'),
            getTop: jasmine.createSpy('getTop').and.resolveTo(null),
            dismiss: jasmine.createSpy('dismiss')
          }
        }
      ]
    });

    TestBed.overrideComponent(MyWardrobesPage, {
      set: { template: '' }
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(MyWardrobesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
