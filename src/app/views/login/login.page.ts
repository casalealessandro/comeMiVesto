import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
import { firstValueFrom } from 'rxjs';
import { FirebaseService } from 'src/app/service/firebase.service';
import { ApiRequestError, AppService } from 'src/app/service/app-service';
import { environment } from 'src/environments/environment';

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

  readonly apiDebugEnabled = !environment.production;
  readonly loginFormApiUrl = `${environment.BASE_API_URL}/gen/forms/loginForm`;

  appServiceDebugStatus = 'IN ATTESA';
  appServiceDebugDetail = '';
  fetchDebugStatus = 'IN ATTESA';
  fetchDebugDetail = '';
  authDebugStatus = 'IN ATTESA';
  authDebugDetail = '';
  private apiDebugExecuted = false;

  constructor(
    private firebase: FirebaseService,
    private userService: UserService,
    private appService: AppService,
    private alert:AlertController,
    private router :Router,
    private route: ActivatedRoute
  ) {}

  ionViewDidEnter(): void {
    if (!this.apiDebugEnabled || this.apiDebugExecuted) return;

    this.apiDebugExecuted = true;
    void this.runAppServiceDebug();
    void this.runFetchDebug();
    void this.runAuthDebug();
  }

  private async runAppServiceDebug(): Promise<void> {
    this.appServiceDebugStatus = 'IN CORSO...';
    this.appServiceDebugDetail = '';

    try {
      const fields = await this.withTimeout(
        firstValueFrom(this.appService.getFormFields('loginForm')),
        8000,
        'AppService timeout'
      );
      this.appServiceDebugStatus = 'HTTP OK';
      this.appServiceDebugDetail = `${fields.length} campi ricevuti`;
    } catch (error) {
      this.appServiceDebugStatus = error instanceof Error && error.message === 'AppService timeout' ? 'TIMEOUT' : 'ERRORE';
      if (error instanceof ApiRequestError) {
        this.appServiceDebugDetail = `HTTP ${error.status} - ${error.message}`;
      } else {
        this.appServiceDebugDetail = error instanceof Error ? error.message : 'Errore sconosciuto';
      }
    }
  }

  private async runFetchDebug(): Promise<void> {
    this.fetchDebugStatus = 'IN CORSO...';
    this.fetchDebugDetail = '';
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(this.loginFormApiUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        this.fetchDebugStatus = `HTTP ${response.status}`;
        this.fetchDebugDetail = payload?.message || response.statusText || 'Risposta non valida';
        return;
      }

      const fields = Array.isArray(payload?.data) ? payload.data : [];
      this.fetchDebugStatus = 'HTTP OK';
      this.fetchDebugDetail = `${fields.length} campi ricevuti`;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.fetchDebugStatus = 'TIMEOUT';
        this.fetchDebugDetail = 'fetch diretto oltre 8 secondi';
      } else {
        this.fetchDebugStatus = 'ERRORE';
        this.fetchDebugDetail = error instanceof Error ? error.message : 'Errore sconosciuto';
      }
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private async runAuthDebug(): Promise<void> {
    this.authDebugStatus = 'IN CORSO...';
    this.authDebugDetail = '';

    try {
      const user = await this.withTimeout(
        this.firebase.waitForAuthState(),
        5000,
        'Auth timeout'
      );
      this.authDebugStatus = 'OK';
      this.authDebugDetail = user ? 'utente autenticato' : 'nessun utente autenticato';
    } catch (error) {
      this.authDebugStatus = error instanceof Error && error.message === 'Auth timeout' ? 'TIMEOUT' : 'ERRORE';
      this.authDebugDetail = error instanceof Error ? error.message : 'Errore sconosciuto';
    }
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)),
    ]);
  }

  async login() {

    const persistence = this.stayConnected ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(this.firebase.auth, persistence);

    const userLoginData  = {
      email: this.email,
      password: this.password

    }

    //this.userService.loginUser('/user/login',userLoginData)
    try {
      const userCredential = await signInWithEmailAndPassword(this.firebase.auth, this.email, this.password);
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
