import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyWardrobesPage } from './my-wardrobes.page';

describe('MyWardrobesPage', () => {
  let component: MyWardrobesPage;
  let fixture: ComponentFixture<MyWardrobesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MyWardrobesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
