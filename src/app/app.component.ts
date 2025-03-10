import { Component, effect } from '@angular/core';
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

  isUserLogin:boolean = false;

  constructor(private afAuth: AngularFireAuth, private router: Router,private userService: UserService,private platform: Platform,) {
   
    this.platform.ready().then(() => {
      this.setupDeepLinkListener();
    });

   /*  effect(() => {
      const user = this.userService.gUserProfile(); // Legge il Signal
      
      if (user()?.uid ) {
        //this.initializeApp();
        this.router.navigateByUrl('/tabs/myoutfit'); // Naviga alla home se loggato
      } else {
        this.forceRedirect()
       
      }
    }); */
  }

  async forceRedirect(){
    const isLogin  = await this.userService.isUserLoggin()
    if(isLogin){
      this.router.navigateByUrl('/tabs/myoutfit'); // Naviga alla home se loggato
    }

    this.router.navigateByUrl('/login'); // Torna alla login se non loggato
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
