import { Component, inject, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { RegisterPayload } from 'src/app/service/interface/user-interface';
import { TermsConditionsPage } from '../terms-conditions/terms-conditions.page';
import { ApiRequestError } from 'src/app/service/app-service';
import { UserService } from 'src/app/service/user.service';
import { finalize } from 'rxjs';
import { DynamicFormComponent } from 'src/app/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss','../login/login.page.scss'],
})

export class RegisterPage {
  @ViewChild(DynamicFormComponent) registrationForm?: DynamicFormComponent;

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
    if (!this.isTermsCheckboxEvent(evt)) return;
    const fieldName = evt.fieldName ?? evt.field?.name;
    if (evt.checked === false) {
      this.setTermsConsent(fieldName, false);
      return;
    }
    this.setTermsConsent(fieldName, false);
    await this.openRegistrationTerms(fieldName);
  }

  isTermsCheckboxEvent(evt: any): boolean {
    const field = evt?.field;
    const options = field?.checkBoxOptions;
    if (field?.type !== 'checkBox' || !options?.haveLink) return false;
    const normalizedLink = `/${String(options.hrefLink ?? '').split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, '')}`;
    return normalizedLink === '/terms-conditions';
  }

  async openRegistrationTerms(fieldName: string): Promise<void> {
    const modal = await this.modalController.create({
      component: TermsConditionsPage,
      componentProps: { mode: 'registration' },
      backdropDismiss: false,
      canDismiss: async (_data, role) => role === 'accepted' || role === 'declined'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss<{ accepted: boolean }>();
    this.setTermsConsent(fieldName, data?.accepted === true);
  }

  private setTermsConsent(fieldName: string, accepted: boolean): void {
    this.termsAccepted = accepted;
    this.registrationForm?.setFieldValue(fieldName, accepted);
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
