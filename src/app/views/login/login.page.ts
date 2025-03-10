import { EmitterVisitorContext } from '@angular/compiler';
import { Component, inject, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {




  email: string = '';
  password: string = '';
  showLogin:boolean=true;
  stayConnected:boolean=true;
  emailRecup:string=''
  auth = getAuth(inject(FirebaseApp));
 
  recupPasswordError:string = 'Inserisci un email valida'
  constructor(private afAuth: AngularFireAuth,private userService: UserService, private alert:AlertController,private router :Router) {}

  async login() {
    
    const persistence = this.stayConnected  ? 'local' : 'session'
    await this.afAuth.setPersistence(persistence);

    const userLoginData  = {
      email: this.email,
      password: this.password
     
    }

    //this.userService.loginUser('/user/login',userLoginData)
    this.afAuth.signInWithEmailAndPassword(this.email, this.password)
      .then((userCredential:any) => {
        if (!userCredential || !userCredential.user) {
          alert('Qualcosa è andato storto');
          return;
        }
        
        const uid = userCredential.user.uid; // Recupera correttamente l'UID
        this.userService.getUserProfile(uid).subscribe(userData => {
          this.userService.setUserInfo(userData);
          sessionStorage.setItem('userProfile',JSON.stringify(userData));
          this.router.navigateByUrl('/tabs/myoutfit');
        })
      })
      .catch(error => {
        console.error(error)
        this.alert.create(
         { 
          header:'Attenzione!',
          message:'Credenziali non valide!',
          buttons: ['Ok'],
          }
        ).then(alert => alert.present());
      });
  }

  async setStayConnected(event:any) {
    const value = event.target.value
    this.stayConnected = value
  }
  submitFormEvent(event:any){
      

      if(event.email && event.password) {
        this.email = event.email;
        this.password = event.password;

        this.login()
      }
  }

  showRecupPassword(){

    this.showLogin = !this.showLogin;

  }

  recuperaPassword(evtForm:any) {
    const email = evtForm.formData.emailRecup
    sendPasswordResetEmail(this.auth,email);
    this.showLogin = !this.showLogin;
    
    
  }
}
