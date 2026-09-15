import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { AppService } from 'src/app/service/app-service';
import { DynamicSelectBoxComponent } from './dynamic-select-box.component';

describe('DynamicSelectBoxComponent', () => {
  let component: DynamicSelectBoxComponent;
  let fixture: ComponentFixture<DynamicSelectBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicSelectBoxComponent],
      providers: [
        {
          provide: ModalController,
          useValue: {
            create: jasmine.createSpy('create'),
            dismiss: jasmine.createSpy('dismiss')
          }
        },
        {
          provide: AppService,
          useValue: {
            getData: jasmine.createSpy('getData')
          }
        }
      ]
    });

    TestBed.overrideComponent(DynamicSelectBoxComponent, {
      set: { template: '' }
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(DynamicSelectBoxComponent);
    component = fixture.componentInstance;
    component.config = {
      name: 'test',
      type: 'selectBox',
      typeInput: 'text',
      label: 'Test',
      selectOptions: {
        displayExp: 'value',
        valueExp: 'id',
        options: [],
        multiple: false,
        parent: null,
        remote: false
      }
    } as any;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
