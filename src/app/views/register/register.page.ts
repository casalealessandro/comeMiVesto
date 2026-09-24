import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { RegisterPayload } from 'src/app/service/interface/user-interface';
import { TermsConditionsPage } from '../terms-conditions/terms-conditions.page';
import { ApiRequestError } from 'src/app/service/app-service';
import { UserService } from 'src/app/service/user.service';
import { finalize, firstValueFrom } from 'rxjs';
import { DynamicFormComponent } from 'src/app/components/dynamic-form/dynamic-form.component';
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseService } from 'src/app/service/firebase.service';
import { SocialAuthService } from 'src/app/service/social-auth.service';

@Component({
  standalone: false,
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
  socialRegistration = false;
  socialSubmitting = false;
  socialNome = '';
  socialCognome = '';
  socialGender: 'U' | 'D' | '' = '';
  constructor(
    private userService: UserService,
    private navController: NavController,
    private alert:AlertController,
    private firebase: FirebaseService,
    private socialAuthService: SocialAuthService,
    private route: ActivatedRoute,
    private router: Router) {
      this.socialRegistration = this.route.snapshot.queryParamMap.get('social') === 'google';
      if (this.socialRegistration) {
        const profile = this.userService.gUserProfile()();
        const googleProfile = this.socialAuthService.getPendingProfile();
        this.socialNome = profile?.nome?.trim() || googleProfile?.givenName || '';
        this.socialCognome = profile?.cognome?.trim() || googleProfile?.familyName || '';
        this.socialGender = profile?.gender === 'U' || profile?.gender === 'D' ? profile.gender : '';
        this.termsAccepted = this.userService.gTermsStatus()()?.accepted === true;
      }
    }

  
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
      next: () => {
        void this.completeRegistrationSession(email, password);
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

  private async completeRegistrationSession(email: string, password: string): Promise<void> {
    try {
      await setPersistence(this.firebase.auth, browserLocalPersistence);
      await signInWithEmailAndPassword(this.firebase.auth, email, password);
      await this.userService.completeAuthenticatedSession();

      const successAlert = await this.alert.create({
        header: 'Complimenti!',
        message: 'Registrazione completata con successo.',
        buttons: ['Ok'],
      });
      await successAlert.present();
      await successAlert.onDidDismiss();
      await this.router.navigateByUrl('/tabs/myoutfit', { replaceUrl: true });
    } catch (error) {
      console.error('Registrazione completata ma avvio sessione non riuscito:', error);
      await this.showAlert(
        'Registrazione completata',
        'Account creato correttamente, ma non è stato possibile avviare la sessione. Accedi con le credenziali appena create.'
      );
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  async completeSocialRegistration(): Promise<void> {
    if (this.socialSubmitting) return;

    if (!this.socialGender) {
      await this.showAlert('Dati mancanti', 'Seleziona il genere per completare il profilo.');
      return;
    }
    if (!this.termsAccepted) {
      await this.showAlert('Termini non accettati', 'Per completare la registrazione devi accettare i Termini di Servizio.');
      return;
    }

    this.socialSubmitting = true;
    try {
      await firstValueFrom(this.userService.completeRegistration({
        nome: this.socialNome.trim(),
        cognome: this.socialCognome.trim(),
        gender: this.socialGender,
        termsAccepted: true,
      }));
      await this.userService.completeAuthenticatedSession();
      this.socialAuthService.clearPendingProfile();
      await this.router.navigateByUrl('/tabs/myoutfit', { replaceUrl: true });
    } catch (error: any) {
      const message = error?.code === 'CONTENT_FLAGGED'
        ? 'Il nome pubblico scelto non può essere utilizzato. Modificalo e riprova.'
        : error?.code === 'MODERATION_UNAVAILABLE'
          ? 'Il controllo dei contenuti non è temporaneamente disponibile. Riprova tra poco.'
          : 'Registrazione non completata. Verifica i dati e riprova.';
      await this.showAlert('Attenzione!', message);
    } finally {
      this.socialSubmitting = false;
    }
  }

  async acceptSocialTerms(): Promise<void> {
    const modal = await this.modalController.create({
      component: TermsConditionsPage,
      componentProps: { mode: 'registration' },
      backdropDismiss: false,
      canDismiss: async (_data, role) => role === 'accepted' || role === 'declined'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss<{ accepted: boolean }>();
    this.termsAccepted = data?.accepted === true;
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


  async handleBackButton() {
    if (this.socialRegistration) {
      this.socialAuthService.clearPendingProfile();
      await this.userService.logOut();
    }
    this.navController.navigateBack('/login');
   }
}
