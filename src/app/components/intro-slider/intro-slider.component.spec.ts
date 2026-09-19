import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { FirebaseService } from 'src/app/service/firebase.service';

import { IntroSliderComponent } from './intro-slider.component';

describe('IntroSliderComponent', () => {
  let component: IntroSliderComponent;
  let fixture: ComponentFixture<IntroSliderComponent>;
  let firebase: { waitForAuthState: jasmine.Spy };
  let router: Router;

  beforeEach(waitForAsync(() => {
    localStorage.removeItem('hasSeenIntro');
    firebase = { waitForAuthState: jasmine.createSpy().and.resolveTo(null) };

    TestBed.configureTestingModule({
      imports: [IntroSliderComponent],
      providers: [
        provideRouter([]),
        { provide: FirebaseService, useValue: firebase }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
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

  it('restores a persisted Firebase session without opening login', async () => {
    firebase.waitForAuthState.and.resolveTo({ uid: 'user-id' });
    (router.navigateByUrl as jasmine.Spy).calls.reset();

    await (component as any).checkFirstTimeUser();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/tabs/myoutfit', { replaceUrl: true });
  });

  it('opens login for a signed-out user that already saw the intro', async () => {
    firebase.waitForAuthState.and.resolveTo(null);
    localStorage.setItem('hasSeenIntro', 'true');
    (router.navigateByUrl as jasmine.Spy).calls.reset();

    await (component as any).checkFirstTimeUser();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/login', { replaceUrl: true });
  });
});
