import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutTabsPage } from './layout-tabs.page';

describe('LayoutTabsPage', () => {
  let component: LayoutTabsPage;
  let fixture: ComponentFixture<LayoutTabsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LayoutTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
