import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="download-page">
      <section class="download-card">
        <img
          class="download-logo"
          src="assets/images/Logo-nero.png"
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
          >
            Scarica su App Store
          </a>

          <a
            class="download-button download-button-secondary"
            [href]="playStoreUrl"
            rel="noopener noreferrer"
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
  readonly appStoreUrl =
    'https://apps.apple.com/it/app/come-mi-vesto-outfit-e-stile/id6670788966';

  readonly playStoreUrl =
    'https://play.google.com/store/apps/details?id=com.acasale.comemivesto';

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    if (Capacitor.isNativePlatform()) {
      void this.router.navigateByUrl('/tabs/myoutfit', { replaceUrl: true });
      return;
    }

    const userAgent = navigator.userAgent || '';
    const isIPadOS =
      navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

    if (/iPad|iPhone|iPod/i.test(userAgent) || isIPadOS) {
      window.location.replace(this.appStoreUrl);
      return;
    }

    if (/Android/i.test(userAgent)) {
      window.location.replace(this.playStoreUrl);
    }
  }
}
