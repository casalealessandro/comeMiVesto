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
        alert('utene')
      })
      .catch(error => {
        console.error(error)
      });
  }

  submitFormEvent(event:any){
      console.log('submitFormEvent-->',event)

      if(event.email && event.password) {
        this.email = event.email;
        this.password = event.password;

        this.login()
      }
  }
}
