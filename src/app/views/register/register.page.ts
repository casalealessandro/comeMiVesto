import { Component, inject, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { UserProfile } from 'src/app/service/interface/user-interface';
import { TermsConditionsPage } from '../terms-conditions/terms-conditions.page';
import { AppService } from 'src/app/service/app-service';
import { UserService } from 'src/app/service/user.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss','../login/login.page.scss'],
})

export class RegisterPage {

  email: string = '';
  password: string = '';
  nome: string = '';
  cognome: string = '';
  userType: string = 'creator'; // Default to creator
  modalController = inject(ModalController)
  submitting: boolean = false;
  constructor(
    private afAuth: AngularFireAuth,
    private appService: AppService,
    private userService: UserService,
    private firestore: AngularFirestore,
    private navController: NavController,
    private alert:AlertController) {}

  
  register(registerData:any) {

    if (this.submitting) return;

    const displayName = !registerData.displayName ? `${this.nome} ${this.cognome}`:registerData.displayName
    const user = displayName;
    const bio = !registerData.bio ? '' : registerData.bio
    const name = !registerData.nome ? '' : registerData.nome
    const cognome = !registerData.cognome ? '' : registerData.cognome
    const password = registerData.password;
    const email = registerData.email ;
    const gender = !registerData.gender ? 'U' : registerData.gender
    let userProfile:Partial<UserProfile> ={
      displayName:displayName,
      email: email,
      password:password,
      name:name,
      nome:name,
      cognome:cognome,
      bio:bio,
      photoURL:'https://ionicframework.com/docs/img/demos/avatar.svg',
      gender:gender,
      createAt: new Date().getTime()
    }
    
    this.submitting = true;
    this.userService.registerUser('/user/register',userProfile)
    .pipe(finalize(() => this.submitting = false))
    .subscribe(data=>{
      this.alert.create(
        { 
         header:'Complimenti!',
         message:`registrazione è avvenuta con successo,controlla la tua email per confermare l'account`,
         buttons: ['Ok'],
         }
       ).then(
          alert => {
            alert.present();
            setTimeout(() => {
              this.handleBackButton()
            }, 500);

       });
    })
    
    /* this.afAuth.createUserWithEmailAndPassword(registerData.email, registerData.password)
      .then((userCredential:any) => {
        const displayName = !registerData.displayName ? `${this.nome} ${this.cognome}`:registerData.displayName
        const user = userCredential.user;
        const bio = !registerData.bio ? '' : registerData.bio
        const name = !registerData.nome ? '' : registerData.nome
        const cognome = !registerData.cognome ? '' : registerData.cognome
        let userProfile:UserProfile ={
          uid:user.uid,
          displayName:displayName,
          email: user.email,
          name:name,
          nome:name,
          cognome:cognome,
          bio:bio,
          photoURL:'https://ionicframework.com/docs/img/demos/avatar.svg',
          gender:user.gender,
          createAt: new Date().getTime()
        }
        // Aggiungi il tipo di utente nel documento utente in Firestore
        this.firestore.collection('users').doc(user.uid).set(userProfile);
        console.log('Registration successful!');
      })
      .catch(error => {
       
        console.error('Registration error:', error);
      }); */
  }

  async functionalCheckBox(evt:any){


    const modal = await  this.modalController.create({
      component: TermsConditionsPage,   
    })

    await modal.present();

    const { data } = await modal.onDidDismiss();
  }


  handleBackButton() {
    // Altrimenti, esegui il comportamento predefinito del back button
    this.navController.back();
   }
}