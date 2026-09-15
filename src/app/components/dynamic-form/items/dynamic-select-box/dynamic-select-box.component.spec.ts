import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DynamicSelectBoxComponent } from './dynamic-select-box.component';

describe('DynamicSelectBoxComponent', () => {
  let component: DynamicSelectBoxComponent;
  let fixture: ComponentFixture<DynamicSelectBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicSelectBoxComponent],
      imports: [
        IonicModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

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
        parent: null
      }
    };

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
