import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavController } from '@ionic/angular';

import { SharedDataService } from 'src/app/service/shared-data.service';
import { LayoutTabsPage } from './layout-tabs.page';

describe('LayoutTabsPage', () => {
  let component: LayoutTabsPage;
  let fixture: ComponentFixture<LayoutTabsPage>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [LayoutTabsPage],
      providers: [
        provideRouter([]),
        {
          provide: SharedDataService,
          useValue: { setData: jasmine.createSpy('setData') }
        },
        {
          provide: NavController,
          useValue: { back: jasmine.createSpy('back') }
        }
      ]
    });

    TestBed.overrideComponent(LayoutTabsPage, {
      set: { template: '' }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(LayoutTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
