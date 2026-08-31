import { Injectable } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { TermsConditionsPage } from '../views/terms-conditions/terms-conditions.page';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class TermsAcceptanceService {
  private activeCheck?: Promise<TermsAccessDecision>;
  constructor(private users: UserService, private modals: ModalController, private alerts: AlertController) {}

  async allowAppAccess(): Promise<TermsAccessDecision> {
    if (this.activeCheck) return this.activeCheck;
    this.activeCheck = this.checkTerms().catch(async () => {
      const alert = await this.alerts.create({
        header: 'Verifica dei Termini non riuscita',
        message: 'Impossibile verificare l’accettazione dei Termini. Controlla la connessione e riprova.',
        buttons: ['Ok']
      });
      await alert.present();
      return 'unavailable' as const;
    });
    try {
      return await this.activeCheck;
    } finally {
      this.activeCheck = undefined;
    }
  }

  private async checkTerms(): Promise<TermsAccessDecision> {
    const status = await firstValueFrom(this.users.getTermsStatus());
    if (status.accepted) return 'accepted';
    const modal = await this.modals.create({
      component: TermsConditionsPage,
      componentProps: { acceptanceMode: true },
      backdropDismiss: false,
      canDismiss: async (_data, role) => role === 'accepted' || role === 'declined'
    });
    await modal.present();
    const result = await modal.onDidDismiss<{ accepted: boolean }>();
    if (result.data?.accepted) return 'accepted';
    await this.users.logOut();
    return 'declined';
  }
}

export type TermsAccessDecision = 'accepted' | 'declined' | 'unavailable';
