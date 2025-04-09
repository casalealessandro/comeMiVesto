import {
  Component,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { defineCustomElements } from '@ionic/core/loader';
import { register } from 'swiper/element/bundle';

// Register Swiper custom elements
register();

@Component({
  selector: 'app-intro-slider',
  templateUrl: './intro-slider.component.html',
  styleUrls: ['./intro-slider.component.scss'],
  standalone: true,
  imports: [IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IntroSliderComponent implements OnInit, AfterViewInit {
  INTRO_STORAGE_KEY = 'hasSeenIntro';

  constructor(private router: Router) {
    defineCustomElements(window);
  }

  ngOnInit() {
    this.checkFirstTimeUser();
  }

  ngAfterViewInit() {
    // Initialize Swiper after view is initialized
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      const swiperParams = {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: false,
        speed: 400,
        pagination: {
          clickable: true,
        },
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
      };

      Object.assign(swiperEl, swiperParams);
      swiperEl.initialize();
    }
  }

  private checkFirstTimeUser(): void {
    try {
      const hasSeenIntro = localStorage.getItem(this.INTRO_STORAGE_KEY);
      if (hasSeenIntro === 'true') {
        this.router.navigateByUrl('/login');
      }
    } catch (error) {
      console.error('Error checking first-time user status:', error);
    }
  }

  finish(): void {
    try {
      localStorage.setItem(this.INTRO_STORAGE_KEY, 'true');
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error saving intro status:', error);
      this.router.navigateByUrl('/login');
    }
  }
}
