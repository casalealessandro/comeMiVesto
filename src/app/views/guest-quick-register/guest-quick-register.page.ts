import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ModalController, IonicModule } from '@ionic/angular';
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TermsConditionsPage } from '../terms-conditions/terms-conditions.page';
import { FirebaseService } from '../../service/firebase.service';
import { UserService } from '../../service/user.service';
import { ApiRequestError } from '../../service/app-service';

interface GuestUpgradeResponse {
  data: { uid: string; emailSent: boolean };
}

@Component({
  selector: 'app-guest-quick-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  template: `
    <ion-content class="ion-padding">
      <div class="quick-registration">
        <img src="assets/images/Logo-nero.png" alt="ComeMiVesto" class="guest-logo">

        <ng-container *ngIf="!saved; else savedOutfit">
          <h1>{{ existingAccount ? 'Accedi per salvare' : 'Salva il tuo outfit' }}</h1>
          <p>{{ existingAccount ? 'Usa il tuo account ComeMiVesto.' : 'Crea un account gratuito. Completerai il profilo nell’app.' }}</p>
          <form (ngSubmit)="submit()">
            <ng-container *ngIf="!existingAccount">
              <ion-input label="Nome" labelPlacement="stacked" name="nome" type="text"
                autocomplete="given-name" [(ngModel)]="nome" required></ion-input>
              <ion-input label="Cognome" labelPlacement="stacked" name="cognome" type="text"
                autocomplete="family-name" [(ngModel)]="cognome" required></ion-input>
            </ng-container>
            <ion-input label="Email" labelPlacement="stacked" name="email" type="email"
              autocomplete="email" [(ngModel)]="email" required></ion-input>
            <ion-input label="Password" labelPlacement="stacked" name="password" type="password"
              autocomplete="existing-password" [(ngModel)]="password" required></ion-input>
            <ng-container *ngIf="!existingAccount">
              <ion-button fill="clear" type="button" (click)="acceptTerms()" [disabled]="accountCreated">
                {{ termsAccepted ? 'Termini di Servizio accettati' : 'Leggi e accetta i Termini di Servizio' }}
              </ion-button>
              <p class="privacy">Registrandoti dichiari di aver preso visione della
                <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.
              </p>
            </ng-container>
            <p class="error" *ngIf="error">{{ error }}</p>
            <ion-button type="submit" expand="block" [disabled]="submitting">
              {{ submitting ? 'Salvataggio...' : 'Continua e salva l’outfit' }}
            </ion-button>
          </form>
          <ion-button fill="clear" *ngIf="!accountCreated" (click)="existingAccount = !existingAccount; error = ''">
            {{ existingAccount ? 'Crea un account' : 'Hai già un account? Accedi' }}
          </ion-button>
          <ion-button fill="clear" routerLink="/tabs/myoutfit">Continua a esplorare</ion-button>
        </ng-container>

        <ng-template #savedOutfit>
          <h1>Outfit salvato!</h1>
          <p>Lo ritroverai tra i preferiti accedendo all'app con la tua email e password.</p>
          <p *ngIf="accountCreated && emailSent">Ti abbiamo inviato un'email per confermare il tuo indirizzo.</p>
          <p *ngIf="accountCreated && !emailSent">Non siamo riusciti a inviare l'email di conferma. Il tuo account è comunque stato creato.</p>
          <ion-button expand="block" routerLink="/download">Scarica ComeMiVesto</ion-button>
          <ion-button fill="clear" routerLink="/tabs/myoutfit">Continua a esplorare</ion-button>
        </ng-template>
      </div>
    </ion-content>
  `,
  styles: [`
    .quick-registration { font-family: 'Instrument Sans', Arial, sans-serif; max-width: 440px; margin: 24px auto; display: flex; flex-direction: column; align-items: stretch; gap: 12px; }
    .guest-logo { width: 180px; align-self: center; margin: 12px 0; }
    h1 { font-size: 24px; text-align: center; margin: 4px 0; }
    p { font-size: 14px; line-height: 1.5; text-align: center; margin: 0; color: #555; }
    form { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
    ion-input { border-bottom: 1px solid #ddd; }
    .privacy { font-size: 12px; }
    .error { color: #ad2020; }
  `],
})
export class GuestQuickRegisterPage implements OnInit {
  outfitId = '';
  nome = '';
  cognome = '';
  email = '';
  password = '';
  termsAccepted = false;
  existingAccount = false;
  submitting = false;
  accountCreated = false;
  emailSent = false;
  saved = false;
  error = '';

  constructor(
    private readonly http: HttpClient,
    private readonly firebase: FirebaseService,
    private readonly users: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly modals: ModalController,
  ) {}

  ngOnInit(): void {
    this.outfitId = this.route.snapshot.queryParamMap.get('outfitId') || '';
    if (!this.outfitId || this.outfitId.includes('/')) {
      void this.router.navigateByUrl('/tabs/myoutfit', { replaceUrl: true });
    }
  }

  async acceptTerms(): Promise<void> {
    const modal = await this.modals.create({
      component: TermsConditionsPage,
      componentProps: { mode: 'registration' },
      backdropDismiss: false,
      canDismiss: async (_data, role) => role === 'accepted' || role === 'declined',
    });
    await modal.present();
    const { data } = await modal.onDidDismiss<{ accepted: boolean }>();
    this.termsAccepted = data?.accepted === true;
  }

  async submit(): Promise<void> {
    if (this.submitting || !this.outfitId) return;
    this.error = '';
    if (!this.existingAccount && !this.accountCreated &&
        (!this.nome.trim() || !this.cognome.trim() || !this.termsAccepted)) {
      this.error = 'Inserisci nome e cognome e accetta i Termini di Servizio.';
      return;
    }
    if (!this.email.trim() || this.password.length < 8) {
      this.error = 'Inserisci un’email valida e una password di almeno 8 caratteri.';
      return;
    }

    this.submitting = true;
    try {
      if (!this.existingAccount && !this.accountCreated) {
        const response = await firstValueFrom(this.http.post<GuestUpgradeResponse>(
          environment.BASE_API_URL + '/user/guest/upgrade', {
            nome: this.nome.trim(), cognome: this.cognome.trim(),
            email: this.email.trim(), password: this.password, termsAccepted: true,
          },
        ));
        this.accountCreated = true;
        this.emailSent = response.data.emailSent;
      }

      await setPersistence(this.firebase.auth, browserLocalPersistence);
      await signInWithEmailAndPassword(this.firebase.auth, this.email.trim(), this.password);
      await this.users.completeAuthenticatedSession();
      await firstValueFrom(this.users.saveFaveUserOutfits(this.outfitId));
      this.saved = true;
      this.password = '';
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === 'EMAIL_ALREADY_EXISTS') {
        this.error = 'Esiste già un account con questa email. Seleziona “Hai già un account? Accedi”.';
      } else if (this.accountCreated) {
        this.error = 'Account creato, ma non è stato possibile salvare l’outfit. Riprova o accedi nell’app.';
      } else {
        this.error = 'Impossibile completare l’operazione. Controlla i dati e riprova.';
      }
    } finally {
      this.submitting = false;
    }
  }
}
