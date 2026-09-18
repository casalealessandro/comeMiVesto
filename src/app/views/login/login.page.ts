import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
import { firstValueFrom } from 'rxjs';
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
export class LoginPage {
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

  async login() {
    try {
      const persistence = this.stayConnected ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(this.firebase.auth, persistence);

      const userCredential = await signInWithEmailAndPassword(this.firebase.auth, this.email, this.password);
      if (!userCredential || !userCredential.user) {
        alert('Qualcosa è andato storto');
        return;
      }

      const uid = userCredential.user.uid;
      const userData = await firstValueFrom(this.userService.getUserProfile(uid));
      this.userService.setUserInfo(userData);
      sessionStorage.setItem('userProfile',JSON.stringify(userData));
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
