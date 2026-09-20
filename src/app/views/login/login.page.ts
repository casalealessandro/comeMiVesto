import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
import { FirebaseService } from 'src/app/service/firebase.service';

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

  constructor(
    private firebase: FirebaseService,
    private userService: UserService,
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

      await userCredential.user.getIdToken(true);
      const bootstrap = await this.userService.loadBootstrap();
      sessionStorage.setItem('userProfile', JSON.stringify(bootstrap.profile));
      await this.router.navigateByUrl(getSafeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')));
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
