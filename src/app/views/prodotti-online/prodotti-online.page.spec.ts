import { signal } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { ModalController, NavController } from '@ionic/angular';

import { AppService } from 'src/app/service/app-service';
import { CategoryService } from 'src/app/service/category.service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { UserService } from 'src/app/service/user.service';
import { ProdottiOnlinePage } from './prodotti-online.page';

describe('ProdottiOnlinePage', () => {
  let component: ProdottiOnlinePage;
  let fixture: ComponentFixture<ProdottiOnlinePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProdottiOnlinePage],
      providers: [
        {
          provide: ModalController,
          useValue: {
            getTop: jasmine.createSpy('getTop').and.resolveTo(null),
            dismiss: jasmine.createSpy('dismiss')
          }
        },
        {
          provide: NavController,
          useValue: { back: jasmine.createSpy('back') }
        },
        {
          provide: CategoryService,
          useValue: {
            categoriesSubject: new BehaviorSubject<any[]>([]),
            categoriesByParent: jasmine.createSpy('categoriesByParent').and.resolveTo([])
          }
        },
        {
          provide: FirebaseService,
          useValue: { authState: EMPTY }
        },
        {
          provide: UserService,
          useValue: {
            gUserProfile: () => signal(null)
          }
        },
        {
          provide: AppService,
          useValue: {
            getData: jasmine.createSpy('getData').and.resolveTo([]),
            filterOutfitProducts: jasmine.createSpy('filterOutfitProducts').and.resolveTo([]),
            createWardrobe: jasmine.createSpy('createWardrobe')
          }
        }
      ]
    });

    TestBed.overrideComponent(ProdottiOnlinePage, {
      set: { template: '' }
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(ProdottiOnlinePage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
