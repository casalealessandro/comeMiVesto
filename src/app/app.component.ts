import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { DeepLinkService } from './service/deep-link.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isUserLogin: boolean = false;

  constructor(
    private platform: Platform,
    private deepLinkService: DeepLinkService
  ) {
    this.platform.ready().then(() => {
      void this.setupDeepLinks();
      this.setStatusBar();
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
