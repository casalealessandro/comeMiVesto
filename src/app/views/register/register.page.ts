import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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

  constructor(private afAuth: AngularFireAuth,private firestore: AngularFirestore) {}

  
  register() {

    this.afAuth.createUserWithEmailAndPassword(this.email, this.password)
      .then((userCredential:any) => {
        // User registered successfully
        const user = userCredential.user;
        // Aggiungi il tipo di utente nel documento utente in Firestore
        this.firestore.collection('users').doc(user.uid).set({
          email: user.email,
          name:this.nome,
          cognome:this.cognome,
          userType: this.userType
        });
        console.log('Registration successful!');
      })
      .catch(error => {
        // Handle registration errors
        console.error('Registration error:', error);
      });
  }
}