import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isUserLogin: boolean = false;

  constructor(
    private router: Router,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.setupDeepLinkListener();
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
  private setupDeepLinkListener() {
    App.addListener('appUrlOpen', (event: any) => {
      const url = event.url;

      // Verifica se l'URL è un deep link riconosciuto
      if (url.startsWith('comemivesto://outfit/')) {
        const outfitId = url.split('/')[2]; // Estrai l'ID dall'URL
        if (outfitId) {
          this.router.navigate([`/detail-outfit/${outfitId}`]);
        }
      }
    });
  }
}
