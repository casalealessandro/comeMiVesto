import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.initializeApp();

  }

  initializeApp() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        // L'utente è già autenticato, reindirizzalo alla pagina principale o a un'altra pagina;
       
        this.router.navigateByUrl('/myoutfit');
      } else {
        // L'utente non è autenticato, reindirizzalo alla pagina di login
        this.router.navigateByUrl('/login');
      }
    });
  }
}
