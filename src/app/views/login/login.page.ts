import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { SocialAuthService } from 'src/app/service/social-auth.service';
import { CrashReportingService } from 'src/app/service/crash-reporting.service';

export function getSafeReturnUrl(returnUrl: string | null | undefined): string {
  if (!returnUrl || returnUrl.startsWith('//') || returnUrl.includes('://') || returnUrl.split(/[?#]/, 1)[0].split('/').includes('..')) return '/tabs/myoutfit';
  if (returnUrl === '/delete-account') return returnUrl;
  return /^\/tabs(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/.test(returnUrl) ? returnUrl : '/tabs/myoutfit';
}

/** DynamicForm emits the raw FormGroup value, not { formData: ... }. */
export function getPasswordRecoveryEmail(
  formValue: { emailRecup?: unknown; email?: unknown } | null | undefined,
): string | null {
  const value = formValue?.emailRecup ?? formValue?.email;
  if (typeof value !== 'string') return null;

  const email = value.trim();
  return email && Validators.email(new FormControl(email)) === null ? email : null;
}

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  showLogin:boolean=true;
  stayConnected:boolean=true;
  emailRecup:string=''
  recupPasswordError:string = 'Inserisci un email valida'
  passwordRecoverySubmitting = false;
  socialSubmitting = false;
  readonly showGoogleLogin = Capacitor.getPlatform() !== 'web';
  readonly showAppleLogin = Capacitor.getPlatform() === 'ios';

  constructor(
    private firebase: FirebaseService,
    private userService: UserService,
    private socialAuthService: SocialAuthService,
    private alert:AlertController,
    private router :Router,
    private route: ActivatedRoute,
    private crashReporting: CrashReportingService,
  ) {}

  ngOnInit(): void {
    this.crashReporting.log('LOGIN_PAGE_OPEN');
    try {
      const hasSeenIntro = localStorage.getItem('hasSeenIntro');
      if (hasSeenIntro !== 'true') {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        void this.router.navigate(['/intro'], {
          queryParams: returnUrl ? { returnUrl } : undefined,
          replaceUrl: true,
        });
      }
    } catch (error) {
      console.error('Error checking intro status:', error);
    }
  }

  async login() {
    try {
      const persistence = this.stayConnected ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(this.firebase.auth, persistence);

      const userCredential = await signInWithEmailAndPassword(this.firebase.auth, this.email, this.password);
      if (!userCredential || !userCredential.user) {
        alert('Qualcosa è andato storto');
        return;
      }

      await this.userService.completeAuthenticatedSession();
      await this.router.navigateByUrl(
        getSafeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')),
        { replaceUrl: true }
      );
    } catch (error) {
      console.error(error)
      this.alert.create(
       {
        header:'Attenzione!',
        message:'Credenziali non valide!',
        buttons: ['Ok'],
        }
      ).then(alert => alert.present());
    }
  }

  async loginWithGoogle(): Promise<void> {
    if (this.socialSubmitting) return;

    this.socialSubmitting = true;
    this.crashReporting.log('GOOGLE_LOGIN_START');
    try {
      await this.socialAuthService.signInWithGoogle();
      this.crashReporting.log('GOOGLE_LOGIN_SESSION_RESOLUTION_START');
      const state = await this.userService.resolveSocialAuthentication();
      this.crashReporting.log('GOOGLE_LOGIN_SESSION_RESOLUTION_SUCCESS');

      if (state === 'registration-required') {
        await this.router.navigate(['/register'], {
          queryParams: { social: 'google' },
          replaceUrl: true,
        });
        return;
      }

      this.socialAuthService.clearPendingProfile();
      await this.router.navigateByUrl(
        getSafeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')),
        { replaceUrl: true },
      );
    } catch (error: any) {
      this.crashReporting.log('GOOGLE_LOGIN_ERROR');
      this.crashReporting.recordError(error, 'GOOGLE_LOGIN_ERROR');
      console.error('Google login failed', error);
      const message = error?.message === 'GOOGLE_CLIENT_ID_NOT_CONFIGURED'
        ? 'Login Google non ancora configurato per questa build.'
        : error?.code === 'auth/account-exists-with-different-credential'
          ? 'Esiste già un account con questa email. Accedi con il metodo usato in precedenza.'
          : 'Impossibile accedere con Google. Riprova.';
      const socialAlert = await this.alert.create({
        header: 'Attenzione!',
        message,
        buttons: ['Ok'],
      });
      await socialAlert.present();
    } finally {
      this.socialSubmitting = false;
    }
  }

  async loginWithApple(): Promise<void> {
    if (this.socialSubmitting) return;

    this.socialSubmitting = true;
    try {
      await this.socialAuthService.signInWithApple();
      const state = await this.userService.resolveSocialAuthentication();

      if (state === 'registration-required') {
        await this.router.navigate(['/register'], {
          queryParams: { social: 'apple' },
          replaceUrl: true,
        });
        return;
      }

      this.socialAuthService.clearPendingProfile();
      await this.router.navigateByUrl(
        getSafeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')),
        { replaceUrl: true },
      );
    } catch (error: any) {
      if (error?.code === 'SIGN_IN_CANCELED') return;

      console.error('Apple login failed', error);
      const message = error?.code === 'auth/account-exists-with-different-credential'
        ? 'Esiste già un account con questa email. Accedi con il metodo usato in precedenza.'
        : 'Impossibile accedere con Apple. Riprova.';
      const socialAlert = await this.alert.create({
        header: 'Attenzione!',
        message,
        buttons: ['Ok'],
      });
      await socialAlert.present();
    } finally {
      this.socialSubmitting = false;
    }
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

  async recuperaPassword(formValue: { emailRecup?: unknown; email?: unknown } | null | undefined): Promise<void> {
    if (this.passwordRecoverySubmitting) return;

    const email = getPasswordRecoveryEmail(formValue);
    if (!email) {
      const invalidEmailAlert = await this.alert.create({
        header: 'Attenzione!',
        message: 'Inserisci un indirizzo email valido.',
        buttons: ['Ok'],
      });
      await invalidEmailAlert.present();
      return;
    }

    this.passwordRecoverySubmitting = true;
    try {
      await sendPasswordResetEmail(this.firebase.auth, email);
      const successAlert = await this.alert.create({
        header: 'Controlla la tua email',
        message: 'Se questo indirizzo è associato a un account con password, riceverai un link per reimpostarla. Controlla anche la cartella Spam.',
        buttons: ['Ok'],
      });
      await successAlert.present();
      this.showLogin = true;
    } catch (error) {
      const failureAlert = await this.alert.create({
        header: 'Attenzione!',
        message: 'Impossibile inviare l’email di recupero password. Riprova tra qualche minuto.',
        buttons: ['Ok'],
      });
      await failureAlert.present();
    } finally {
      this.passwordRecoverySubmitting = false;
    }
  }
}
