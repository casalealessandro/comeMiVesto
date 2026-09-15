import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IntroSliderComponent } from './intro-slider.component';

describe('IntroSliderComponent', () => {
  let component: IntroSliderComponent;
  let fixture: ComponentFixture<IntroSliderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IntroSliderComponent],
      providers: [provideRouter([])]
    });

    TestBed.overrideComponent(IntroSliderComponent, {
      set: { template: '' }
    });

    TestBed.compileComponents();

    localStorage.removeItem('hasSeenIntro');
    fixture = TestBed.createComponent(IntroSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
