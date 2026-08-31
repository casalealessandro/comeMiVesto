import { Component, inject, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { RegisterPayload } from 'src/app/service/interface/user-interface';
import { TermsConditionsPage } from '../terms-conditions/terms-conditions.page';
import { ApiRequestError } from 'src/app/service/app-service';
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
  termsAccepted = false;
  constructor(
    private afAuth: AngularFireAuth,
    private userService: UserService,
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
    if (!this.termsAccepted) {
      void this.showAlert('Termini non accettati', 'Per registrarti devi accettare i Termini di Servizio.');
      return;
    }
    const userProfile: RegisterPayload ={
      displayName:displayName,
      email: email,
      password:password,
      nome:name,
      cognome:cognome,
      bio:bio,
      gender: gender === 'D' ? 'D' : 'U',
      termsAccepted: true
    }
    
    this.submitting = true;
    this.userService.registerUser('/user/register',userProfile)
    .pipe(finalize(() => this.submitting = false))
    .subscribe({
      next: (data) => {
        this.alert.create(
          {
            header:'Complimenti!',
            message:'Registrazione completata con successo. Ora puoi accedere a ComeMiVesto.',
            buttons: ['Ok'],
            }
          ).then(
            alert => {
              alert.present();
              setTimeout(() => {
                this.handleBackButton()
              }, 500);

        });
      },
      error: (error: ApiRequestError) => {
        const message = error.code === 'CONTENT_FLAGGED'
          ? 'Il nome pubblico scelto non può essere utilizzato. Modificalo e riprova.'
          : error.code === 'MODERATION_UNAVAILABLE'
            ? 'Il controllo dei contenuti non è temporaneamente disponibile. Riprova tra poco.'
            : 'Registrazione non completata. Verifica i dati e riprova.';
        void this.showAlert('Attenzione!', message);
      }
    })
    
  }

  async functionalCheckBox(evt:any){
    if (typeof evt?.checked === 'boolean') {
      if (this.isTermsCheckboxEvent(evt)) this.termsAccepted = evt.checked;
      return;
    }

    const modal = await  this.modalController.create({
      component: TermsConditionsPage,   
    })

    await modal.present();

    const { data } = await modal.onDidDismiss();
  }

  isTermsCheckboxEvent(evt: any): boolean {
    const field = evt?.field;
    const options = field?.checkBoxOptions;
    if (typeof evt?.checked !== 'boolean' || field?.type !== 'checkBox' || !options?.haveLink) return false;
    const normalizedLink = `/${String(options.hrefLink ?? '').split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, '')}`;
    return normalizedLink === '/terms-conditions';
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alert.create({ header, message, buttons: ['Ok'] });
    await alert.present();
  }


  handleBackButton() {
    // Altrimenti, esegui il comportamento predefinito del back button
    this.navController.back();
   }
}
