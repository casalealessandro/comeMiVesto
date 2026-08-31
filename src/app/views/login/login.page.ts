import { Component, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
import { firstValueFrom } from 'rxjs';

export function getSafeReturnUrl(returnUrl: string | null | undefined): string {
  if (!returnUrl || !returnUrl.startsWith('/tabs') || returnUrl.startsWith('//') || returnUrl.includes('://') || returnUrl.split(/[?#]/, 1)[0].split('/').includes('..')) return '/tabs/myoutfit';
  return /^\/tabs(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/.test(returnUrl) ? returnUrl : '/tabs/myoutfit';
}
@Component({
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
  auth = getAuth(inject(FirebaseApp));

  recupPasswordError:string = 'Inserisci un email valida'
  constructor(private afAuth: AngularFireAuth,private userService: UserService, private alert:AlertController,private router :Router, private route: ActivatedRoute) {}

  async login() {

    const persistence = this.stayConnected  ? 'local' : 'session'
    await this.afAuth.setPersistence(persistence);

    const userLoginData  = {
      email: this.email,
      password: this.password

    }

    //this.userService.loginUser('/user/login',userLoginData)
    try {
      const userCredential: any = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
        if (!userCredential || !userCredential.user) {
          alert('Qualcosa è andato storto');
          return;
        }

        const uid = userCredential.user.uid; // Recupera correttamente l'UID
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
      await sendPasswordResetEmail(this.auth,email);
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
