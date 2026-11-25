import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { browserSessionPersistence, setPersistence, signInWithCustomToken, signOut } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FirebaseService } from '../../service/firebase.service';
import { UserService } from '../../service/user.service';

interface GuestRegistrationResponse {
  data: { customToken: string; expiresAt: number };
}

@Component({
  selector: 'app-guest-auth',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content class="ion-padding">
      <div class="guest-entry">
        <img src="assets/images/Logo-nero.png" alt="ComeMiVesto" class="guest-logo">
        <h1>{{ expired ? 'La prova è terminata' : 'Scopri ComeMiVesto' }}</h1>
        <p *ngIf="loading">Prepariamo i tuoi outfit...</p>
        <ion-spinner *ngIf="loading" name="crescent"></ion-spinner>
        <p *ngIf="expired">Grazie per aver provato ComeMiVesto. Puoi continuare dall'app.</p>
        <p *ngIf="error">La prova non è disponibile in questo momento.</p>
        <ion-button *ngIf="error" (click)="start()">Riprova</ion-button>
        <ion-button *ngIf="expired || error" (click)="openDownload()">Scarica ComeMiVesto</ion-button>
        <p class="guest-privacy"><a href="/privacy">Informativa privacy</a></p>
      </div>
    </ion-content>
  `,
  styles: [`
    .guest-entry { max-width: 420px; min-height: 75vh; margin: auto; display: flex;
      flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 14px; }
    .guest-logo { width: min(220px, 75%); height: auto; }
    h1 { font-size: 1.5rem; margin: 8px 0 0; }
    p { margin: 0; color: #545454; }
  `],
})
export class GuestAuthPage implements OnInit {
  loading = true;
  expired = false;
  error = false;

  constructor(
    private readonly http: HttpClient,
    private readonly firebase: FirebaseService,
    private readonly users: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    void this.start();
  }

  async start(): Promise<void> {
    this.loading = true;
    this.error = false;
    try {
      const currentUser = await this.firebase.waitForAuthState();
      const claims = currentUser ? (await currentUser.getIdTokenResult()).claims : null;
      const guest = claims?.['role'] === 'guest';

      // Never replace an existing registered user with a demo account.
      if (currentUser && !guest) {
        await this.router.navigateByUrl('/tabs/myoutfit', { replaceUrl: true });
        return;
      }

      const requestedExpired = this.route.snapshot.queryParamMap.get('expired') === '1';
      const expiresAt = Number(claims?.['guestExpiresAt']);
      if (requestedExpired || (guest && (!Number.isFinite(expiresAt) || Date.now() >= expiresAt))) {
        if (currentUser && guest) await signOut(this.firebase.auth);
        this.expired = true;
        return;
      }

      if (!currentUser) {
        const response = await firstValueFrom(this.http.post<GuestRegistrationResponse>(
          `${environment.BASE_API_URL}/user/guest`, { gender: this.route.snapshot.queryParamMap.get('gender') === 'U' ? 'U' : 'D' },
        ));
        await setPersistence(this.firebase.auth, browserSessionPersistence);
        await signInWithCustomToken(this.firebase.auth, response.data.customToken);
      }

      await this.users.completeAuthenticatedSession();
      await this.router.navigateByUrl('/tabs/myoutfit', { replaceUrl: true });
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  openDownload(): void {
    void this.router.navigateByUrl('/download');
  }
}
