import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddOutfitPage } from './add-outfit.page';

describe('AddOutfitPage', () => {
  let component: AddOutfitPage;
  let fixture: ComponentFixture<AddOutfitPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddOutfitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
