import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { filter, take } from 'rxjs';
import { DeepLinkService } from './service/deep-link.service';
import { PushNotificationService } from './service/push-notification.service';
import { CrashReportingService } from './service/crash-reporting.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isUserLogin: boolean = false;
  isAppStarting: boolean = true;

  private readonly startupStartedAt = performance.now();

  constructor(
    private platform: Platform,
    private deepLinkService: DeepLinkService,
    private pushNotificationService: PushNotificationService,
    private crashReporting: CrashReportingService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      take(1)
    ).subscribe(() => {
      this.logStartupStep('INITIAL_NAVIGATION_READY');
      setTimeout(() => {
        this.isAppStarting = false;
      });
    });

    this.platform.ready().then(() => {
      void this.crashReporting.initializeBuildContext();
      void this.setupDeepLinks();
      void this.pushNotificationService.initialize();
      void this.setStatusBar();
      void this.hideNativeSplash();
    });
  }

  async setStatusBar() {
    try {
      await StatusBar.setBackgroundColor({ color: '#F4F5F8' });
      await StatusBar.setStyle({ style: Style.Light });

      console.log('setting status bar');
    } catch (error) {
      console.error('Error setting status bar:', error);
    }
  }

  private async hideNativeSplash(): Promise<void> {
    try {
      // Attende il primo frame Angular: quando lo splash nativo sparisce
      // la WebView mostra già la schermata di avvio dell'app.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await SplashScreen.hide();
      this.logStartupStep('NATIVE_SPLASH_HIDDEN');
    } catch (error) {
      console.warn('Error hiding native splash screen:', error);
    }
  }

  private logStartupStep(step: string): void {
    const elapsedMs = Math.round(performance.now() - this.startupStartedAt);
    console.log(`[Startup] ${step} +${elapsedMs}ms`);
    this.crashReporting.log(`STARTUP_${step} elapsedMs=${elapsedMs}`);
  }

  private async setupDeepLinks(): Promise<void> {
    await App.addListener('appUrlOpen', (event) => {
      this.deepLinkService.handle(event.url);
    });

    const launchUrl = await App.getLaunchUrl();
    if (launchUrl?.url) {
      this.deepLinkService.handle(launchUrl.url);
    }
  }
}
