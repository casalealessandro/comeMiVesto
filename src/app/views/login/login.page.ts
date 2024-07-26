import { EmitterVisitorContext } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {


  email: string = '';
  password: string = '';

  constructor(private afAuth: AngularFireAuth) {}

  login() {
    this.afAuth.signInWithEmailAndPassword(this.email, this.password)
      .then(() => {
        // Utente loggato con successo
      })
      .catch(error => {
        // Gestione degli errori durante il login
      });
  }

  submitFormEvent(event:any){
      console.log('submitFormEvent-->',event)
  }
}
