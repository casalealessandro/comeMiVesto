import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailOutfitPage } from './detail-outfit.page';

describe('DetailOutfitPage', () => {
  let component: DetailOutfitPage;
  let fixture: ComponentFixture<DetailOutfitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailOutfitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
