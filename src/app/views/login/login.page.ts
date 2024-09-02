import { EmitterVisitorContext } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {


  email: string = '';
  password: string = '';

  constructor(private afAuth: AngularFireAuth,private router: Router, private alert:AlertController) {}

  login() {

    this.afAuth.signInWithEmailAndPassword(this.email, this.password)
      .then((userCredential:any) => {
        console.log('userCredential-->',userCredential)
        //this.router.navigate(['/myoutfit'], { skipLocationChange: true, replaceUrl: true })
      })
      .catch(error => {
        this.alert.create(
         { 
          header:'Attenzione!',
          message:'Credenziali non valide!',
          buttons: ['Ok'],
          }
        )
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
