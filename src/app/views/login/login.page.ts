import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { SocialAuthService } from 'src/app/service/social-auth.service';

export function getSafeReturnUrl(returnUrl: string | null | undefined): string {
  if (!returnUrl || !returnUrl.startsWith('/tabs') || returnUrl.startsWith('//') || returnUrl.includes('://') || returnUrl.split(/[?#]/, 1)[0].split('/').includes('..')) return '/tabs/myoutfit';
  return /^\/tabs(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/.test(returnUrl) ? returnUrl : '/tabs/myoutfit';
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
  socialSubmitting = false;
  readonly showGoogleLogin = Capacitor.getPlatform() !== 'web';

  constructor(
    private firebase: FirebaseService,
    private userService: UserService,
    private socialAuthService: SocialAuthService,
    private alert:AlertController,
    private router :Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
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
    try {
      await this.socialAuthService.signInWithGoogle();
      const state = await this.userService.resolveSocialAuthentication();

      if (state === 'registration-required') {
        await this.router.navigate(['/register'], {
          queryParams: { social: 'google' },
          replaceUrl: true,
        });
        return;
      }

      await this.router.navigateByUrl(
        getSafeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')),
        { replaceUrl: true },
      );
    } catch (error: any) {
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

  async recuperaPassword(evtForm:any) {
    const email = evtForm.formData.emailRecup
    try {
      await sendPasswordResetEmail(this.firebase.auth,email);
      this.showLogin = !this.showLogin;
    } catch (error) {
      this.alert.create(
        {
          header:'Attenzione!',
          message:'Impossibile inviare email di recupero password.',
          buttons: ['Ok'],
        }
      ).then(alert => alert.present());
    }
  }
}
