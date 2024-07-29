import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyoutfitPage } from './myoutfit.page';

describe('MyoutfitPage', () => {
  let component: MyoutfitPage;
  let fixture: ComponentFixture<MyoutfitPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MyoutfitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
