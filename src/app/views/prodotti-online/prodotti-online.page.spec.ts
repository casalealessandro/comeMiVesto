import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProdottiOnlinePage } from './prodotti-online.page';

describe('ProdottiOnlinePage', () => {
  let component: ProdottiOnlinePage;
  let fixture: ComponentFixture<ProdottiOnlinePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdottiOnlinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
