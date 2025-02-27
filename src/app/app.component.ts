import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { UserService } from './service/user.service';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private afAuth: AngularFireAuth, private router: Router,private userService: UserService,private platform: Platform,) {
    this.initializeApp();
    this.platform.ready().then(() => {
      this.setupDeepLinkListener();
    });
  }

  async initializeApp() {
    this.afAuth.authState.subscribe(async user => {
      
      if (user) {
        // L'utente è già autenticato, reindirizzalo alla pagina principale o a un'altra pagina;
       
            // Carica e memorizza i dettagli dell'utente nel servizio
        const isUserLoaded = await this.userService.loadUser();
        if (isUserLoaded) {
          this.router.navigateByUrl('/tabs/myoutfit');
        } 
          
          
       
        
      } else {
        // L'utente non è autenticato, reindirizzalo alla pagina di login
        this.router.navigateByUrl('/login');
      }
    });
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
