import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { UserProfile } from 'src/app/service/interface/user-interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})

export class RegisterPage {

  email: string = '';
  password: string = '';
  nome: string = '';
  cognome: string = '';
  userType: string = 'creator'; // Default to creator

  constructor(private afAuth: AngularFireAuth,private firestore: AngularFirestore,  private navController: NavController) {}

  
  register(registerData:any) {
   
    
    this.afAuth.createUserWithEmailAndPassword(registerData.email, registerData.password)
      .then((userCredential:any) => {
        const displayName = !registerData.displayName ? `${this.nome} ${this.cognome}`:registerData.displayName
        const user = userCredential.user;
        const bio = !registerData.bio ? '' : registerData.bio
        const name = !registerData.name ? '' : registerData.name
        const cognome = !registerData.cognome ? '' : registerData.cognome
        let userProfile:UserProfile ={
          uid:user.uid,
          displayName:displayName,
          email: user.email,
          name:name,
          nome:name,
          cognome:cognome,
          bio:bio
        }
        // Aggiungi il tipo di utente nel documento utente in Firestore
        this.firestore.collection('users').doc(user.uid).set(userProfile);
        console.log('Registration successful!');
      })
      .catch(error => {
        // Handle registration errors
        console.error('Registration error:', error);
      });
  }

  handleBackButton() {
    // Altrimenti, esegui il comportamento predefinito del back button
    this.navController.back();
   }
}