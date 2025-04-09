import { Component, effect } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { UserService } from './service/user.service';
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
    private afAuth: AngularFireAuth,
    private router: Router,
    private userService: UserService,
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
  async initializeApp() {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        // L'utente è già autenticato, reindirizzalo alla pagina principale o a un'altra pagina;

        // Carica e memorizza i dettagli dell'utente nel servizio
        const isUserLoaded = await this.userService.loadUser();
        if (isUserLoaded) {
          this.router.navigateByUrl('/tabs/myoutfit');
        }
      } else {
        this.forceRedirect();
      }
    });
  }

  async forceRedirect() {
    const isLogin = await this.userService.isUserLoggin();
    if (isLogin) {
      this.router.navigateByUrl('/tabs/myoutfit'); // Naviga alla home se loggato
    }
    console.log('isLogin -- ', isLogin);
    this.router.navigateByUrl('/login'); // Torna alla login se non loggato
    //this.router.navigateByUrl('/intro'); // Torna alla login se non loggato
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
