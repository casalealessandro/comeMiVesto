import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { IntroSliderComponent } from './intro-slider.component';

describe('IntroSliderComponent', () => {
  let component: IntroSliderComponent;
  let fixture: ComponentFixture<IntroSliderComponent>;

  beforeEach(waitForAsync(() => {
    localStorage.removeItem('hasSeenIntro');

    TestBed.configureTestingModule({
      imports: [IntroSliderComponent],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IntroSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  afterEach(() => {
    localStorage.removeItem('hasSeenIntro');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
