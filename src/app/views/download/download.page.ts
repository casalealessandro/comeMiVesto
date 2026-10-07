import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { FirebaseService } from '../../service/firebase.service';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="download-page">
      <section class="download-card">
        <img
          class="download-logo"
          [src]="logoDataUri"
          alt="ComeMiVesto"
        />

        <h1>Scarica ComeMiVesto</h1>
        <p class="download-copy">
          Ti stiamo portando automaticamente allo store corretto per il tuo dispositivo.
        </p>

        <div class="download-actions">
          <a
            class="download-button download-button-primary"
            [href]="appStoreUrl"
            rel="noopener noreferrer"
            (click)="trackManualStoreClick('app_store')"
          >
            Scarica su App Store
          </a>

          <a
            class="download-button download-button-secondary"
            [href]="playStoreUrl"
            rel="noopener noreferrer"
            (click)="trackManualStoreClick('google_play')"
          >
            Disponibile su Google Play
          </a>
        </div>

        <p class="download-fallback">
          Se il reindirizzamento non parte automaticamente, scegli il tuo store.
        </p>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100%;
      font-family: 'Instrument Sans', Arial, sans-serif;
      color: #3f3f3f;
      background: #ffffff;
    }

    .download-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #ffffff;
    }

    .download-card {
      width: min(100%, 420px);
      text-align: center;
    }

    .download-logo {
      width: min(240px, 72vw);
      height: auto;
      margin-bottom: 42px;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(28px, 7vw, 38px);
      line-height: 1.1;
      font-weight: 700;
      color: #000000;
    }

    .download-copy {
      margin: 0 auto 30px;
      max-width: 360px;
      font-size: 16px;
      line-height: 1.5;
      color: #5f5f5f;
    }

    .download-actions {
      display: grid;
      gap: 12px;
    }

    .download-button {
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 18px;
      border-radius: 5px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      box-sizing: border-box;
    }

    .download-button-primary {
      color: #ffffff;
      background: #000000;
      border: 1px solid #000000;
    }

    .download-button-secondary {
      color: #000000;
      background: #ffffff;
      border: 1px solid #bdbdbd;
    }

    .download-fallback {
      margin: 18px 0 0;
      font-size: 13px;
      line-height: 1.4;
      color: #7a7a7a;
    }
  `],
})
export class DownloadPage implements OnInit {
  readonly logoDataUri = 'data:image/png;base64,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';

  readonly appStoreUrl =
    'https://apps.apple.com/it/app/come-mi-vesto-outfit-e-stile/id6670788966';

  readonly playStoreUrl =
    'https://play.google.com/store/apps/details?id=com.acasale.comemivesto';

  constructor(
    private readonly router: Router,
    private readonly firebaseService: FirebaseService,
  ) {}

  ngOnInit(): void {
    if (Capacitor.isNativePlatform()) {
      void this.router.navigateByUrl('/tabs/myoutfit', { replaceUrl: true });
      return;
    }

    const userAgent = navigator.userAgent || '';
    const isIPadOS =
      navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

    if (/iPad|iPhone|iPod/i.test(userAgent) || isIPadOS) {
      this.trackAndRedirect('app_store', 'ios', this.appStoreUrl);
      return;
    }

    if (/Android/i.test(userAgent)) {
      this.trackAndRedirect('google_play', 'android', this.playStoreUrl);
    }
  }

  trackManualStoreClick(store: 'app_store' | 'google_play'): void {
    const platform = store === 'app_store' ? 'ios' : 'android';
    this.trackDownloadEvent('download_store_click', store, platform, 'manual');
  }

  private trackAndRedirect(
    store: 'app_store' | 'google_play',
    platform: 'ios' | 'android',
    destination: string,
  ): void {
    this.trackDownloadEvent('download_store_redirect', store, platform, 'automatic');

    window.setTimeout(() => {
      window.location.replace(destination);
    }, 250);
  }

  private trackDownloadEvent(
    eventName: 'download_store_redirect' | 'download_store_click',
    store: 'app_store' | 'google_play',
    platform: 'ios' | 'android',
    redirectMode: 'automatic' | 'manual',
  ): void {
    try {
      const query = new URLSearchParams(window.location.search);
      const analytics = getAnalytics(this.firebaseService.app);

      logEvent(analytics, eventName, {
        store,
        platform,
        redirect_mode: redirectMode,
        utm_source: query.get('utm_source') || 'direct',
        utm_medium: query.get('utm_medium') || 'none',
        utm_campaign: query.get('utm_campaign') || 'none',
        utm_content: query.get('utm_content') || 'none',
      });
    } catch (error) {
      console.warn('[download] analytics event not sent', error);
    }
  }
}
