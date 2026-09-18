import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
import { firstValueFrom } from 'rxjs';
import { FirebaseService } from 'src/app/service/firebase.service';
import { ApiRequestError } from 'src/app/service/app-service';
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

  readonly loginDebugEnabled = !environment.production;
  persistenceDebugStatus = 'IN ATTESA';
  persistenceDebugDetail = '';
  firebaseLoginDebugStatus = 'IN ATTESA';
  firebaseLoginDebugDetail = '';
  backendTokenDebugStatus = 'IN ATTESA';
  backendTokenDebugDetail = '';
  tokenDebugStatus = 'IN ATTESA';
  tokenDebugDetail = '';
  profileDebugStatus = 'IN ATTESA';
  profileDebugDetail = '';
  navigationDebugStatus = 'IN ATTESA';
  navigationDebugDetail = '';

  constructor(
    private firebase: FirebaseService,
    private userService: UserService,
    private alert:AlertController,
    private router :Router,
    private route: ActivatedRoute
  ) {}

  async login() {
    this.resetLoginDebug();

    try {
      const persistence = this.stayConnected ? browserLocalPersistence : browserSessionPersistence;
      this.persistenceDebugStatus = 'IN CORSO...';
      await this.withTimeout(
        setPersistence(this.firebase.auth, persistence),
        5000,
        'Persistence timeout'
      );
      this.persistenceDebugStatus = 'OK';
      this.persistenceDebugDetail = this.stayConnected ? 'local persistence' : 'session persistence';

      this.firebaseLoginDebugStatus = 'IN CORSO...';
      const userCredential = await this.withTimeout(
        signInWithEmailAndPassword(this.firebase.auth, this.email, this.password),
        8000,
        'Firebase login timeout'
      );
      if (!userCredential?.user) {
        throw new Error('Firebase non ha restituito un utente');
      }
      this.firebaseLoginDebugStatus = 'OK';
      this.firebaseLoginDebugDetail = 'utente Firebase autenticato';

      this.tokenDebugStatus = 'IN CORSO...';
      const token = await this.withTimeout(
        userCredential.user.getIdToken(),
        5000,
        'Firebase ID token timeout'
      );
      if (!token) {
        throw new Error('Firebase ID token vuoto');
      }
      this.tokenDebugStatus = 'OK';
      this.tokenDebugDetail = 'ID token disponibile';

      const uid = userCredential.user.uid;
      this.profileDebugStatus = 'IN CORSO...';
      const userData = await this.withTimeout(
        firstValueFrom(this.userService.getUserProfile(uid)),
        8000,
        'Profilo API timeout'
      );
      this.profileDebugStatus = 'HTTP OK';
      this.profileDebugDetail = 'profilo utente ricevuto';

      this.userService.setUserInfo(userData);
      sessionStorage.setItem('userProfile',JSON.stringify(userData));

      this.navigationDebugStatus = 'IN CORSO...';
      const destination = getSafeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
      const navigated = await this.withTimeout(
        this.router.navigateByUrl(destination),
        5000,
        'Navigazione timeout'
      );
      this.navigationDebugStatus = navigated ? 'OK' : 'ERRORE';
      this.navigationDebugDetail = destination;
    } catch (error) {
      console.error(error);
      const detail = this.debugErrorDetail(error);

      if (this.persistenceDebugStatus === 'IN CORSO...') {
        this.persistenceDebugStatus = this.isTimeout(error) ? 'TIMEOUT' : 'ERRORE';
        this.persistenceDebugDetail = detail;
      } else if (this.firebaseLoginDebugStatus === 'IN CORSO...') {
        this.firebaseLoginDebugStatus = this.isTimeout(error) ? 'TIMEOUT' : 'ERRORE';
        this.firebaseLoginDebugDetail = detail;
        if (this.loginDebugEnabled) {
          await this.runBackendTokenDebug();
        }
      } else if (this.tokenDebugStatus === 'IN CORSO...') {
        this.tokenDebugStatus = this.isTimeout(error) ? 'TIMEOUT' : 'ERRORE';
        this.tokenDebugDetail = detail;
      } else if (this.profileDebugStatus === 'IN CORSO...') {
        this.profileDebugStatus = this.isTimeout(error) ? 'TIMEOUT' : 'ERRORE';
        this.profileDebugDetail = detail;
      } else if (this.navigationDebugStatus === 'IN CORSO...') {
        this.navigationDebugStatus = this.isTimeout(error) ? 'TIMEOUT' : 'ERRORE';
        this.navigationDebugDetail = detail;
      }

      this.alert.create(
        {
          header:'Attenzione!',
          message:'Credenziali non valide!',
          buttons: ['Ok'],
        }
      ).then(alert => alert.present());
    }
  }

  private resetLoginDebug(): void {
    this.persistenceDebugStatus = 'IN ATTESA';
    this.persistenceDebugDetail = '';
    this.firebaseLoginDebugStatus = 'IN ATTESA';
    this.firebaseLoginDebugDetail = '';
    this.backendTokenDebugStatus = 'IN ATTESA';
    this.backendTokenDebugDetail = '';
    this.tokenDebugStatus = 'IN ATTESA';
    this.tokenDebugDetail = '';
    this.profileDebugStatus = 'IN ATTESA';
    this.profileDebugDetail = '';
    this.navigationDebugStatus = 'IN ATTESA';
    this.navigationDebugDetail = '';
  }

  private async runBackendTokenDebug(): Promise<void> {
    this.backendTokenDebugStatus = 'IN CORSO...';
    this.backendTokenDebugDetail = '';

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${environment.BASE_API_URL}/user/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password }),
        cache: 'no-store',
        signal: controller.signal,
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.ok) {
        this.backendTokenDebugStatus = 'HTTP OK';
        this.backendTokenDebugDetail = 'Firebase backend ha autenticato le credenziali';
        return;
      }

      this.backendTokenDebugStatus = `HTTP ${response.status}`;
      this.backendTokenDebugDetail = payload?.message || response.statusText || 'Risposta non valida';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.backendTokenDebugStatus = 'TIMEOUT';
        this.backendTokenDebugDetail = 'POST /user/token oltre 8 secondi';
      } else {
        this.backendTokenDebugStatus = 'ERRORE';
        this.backendTokenDebugDetail = error instanceof Error ? error.message : 'Errore sconosciuto';
      }
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)),
    ]);
  }

  private isTimeout(error: unknown): boolean {
    return error instanceof Error && error.message.toLowerCase().includes('timeout');
  }

  private debugErrorDetail(error: unknown): string {
    if (error instanceof ApiRequestError) {
      return `HTTP ${error.status} - ${error.message}`;
    }

    if (error instanceof Error) {
      const code = (error as Error & { code?: string }).code;
      return code ? `${code} - ${error.message}` : error.message;
    }

    return 'Errore sconosciuto';
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
