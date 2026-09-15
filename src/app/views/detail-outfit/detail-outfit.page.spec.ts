import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { ModalController, NavController } from '@ionic/angular';

import { AppService } from 'src/app/service/app-service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { DetailOutfitPage } from './detail-outfit.page';

describe('DetailOutfitPage', () => {
  let component: DetailOutfitPage;
  let fixture: ComponentFixture<DetailOutfitPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DetailOutfitPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({}))
          }
        },
        {
          provide: AppService,
          useValue: {
            selectedProduct: signal<any>(null),
            getOutfit: jasmine.createSpy('getOutfit'),
            filterOutfitProducts: jasmine.createSpy('filterOutfitProducts').and.resolveTo([]),
            createWardrobe: jasmine.createSpy('createWardrobe')
          }
        },
        {
          provide: FirebaseService,
          useValue: { authState: EMPTY }
        },
        {
          provide: SharedDataService,
          useValue: {
            setData: jasmine.createSpy('setData')
          }
        },
        {
          provide: ModalController,
          useValue: {
            dismiss: jasmine.createSpy('dismiss'),
            getTop: jasmine.createSpy('getTop').and.resolveTo(null)
          }
        },
        {
          provide: NavController,
          useValue: { back: jasmine.createSpy('back') }
        }
      ]
    });

    TestBed.overrideComponent(DetailOutfitPage, {
      set: { template: '' }
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(DetailOutfitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
