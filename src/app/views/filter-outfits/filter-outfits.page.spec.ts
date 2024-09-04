import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterOutfitsPage } from './filter-outfits.page';

describe('FilterOutfitsPage', () => {
  let component: FilterOutfitsPage;
  let fixture: ComponentFixture<FilterOutfitsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterOutfitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
