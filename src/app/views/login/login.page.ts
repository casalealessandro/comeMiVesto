import { EmitterVisitorContext } from '@angular/compiler';
import { Component, inject, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {



  email: string = '';
  password: string = '';
  showLogin:boolean=true;
  emailRecup:string=''
  auth = getAuth(inject(FirebaseApp));
 
  recupPasswordError:string = 'Inserisci un email valida'
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
        ).then(alert => alert.present());
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

  showRecupPassword(){

    this.showLogin = !this.showLogin;

  }

  recuperaPassword(form:NgForm) {
   if(!form.valid){
   
    form.controls['emailRecup'].markAsTouched();
    return
   }
      
    sendPasswordResetEmail(this.auth,this.emailRecup)
    this.showLogin = !this.showLogin;
    
    
  }
}
