import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { UserService } from './service/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private afAuth: AngularFireAuth, private router: Router,private userService: UserService) {
    this.initializeApp();

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
}
