import { Injectable } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { TermsConditionsPage } from '../views/terms-conditions/terms-conditions.page';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class TermsAcceptanceService {
  private activeCheck?: Promise<TermsAccessDecision>;
  private acceptedUserId?: string;
  constructor(private users: UserService, private modals: ModalController, private alerts: AlertController) {}

  async allowAppAccess(userId?: string): Promise<TermsAccessDecision> {
    if (userId && this.acceptedUserId === userId) return 'accepted';
    if (this.activeCheck) return this.activeCheck;
    this.activeCheck = this.checkTerms(userId).catch(async () => {
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

  private async checkTerms(userId?: string): Promise<TermsAccessDecision> {
    const status = await firstValueFrom(this.users.getTermsStatus());
    if (status.accepted) {
      this.acceptedUserId = userId;
      return 'accepted';
    }
    const modal = await this.modals.create({
      component: TermsConditionsPage,
      componentProps: { mode: 'authenticated' },
      backdropDismiss: false,
      canDismiss: async (_data, role) => role === 'accepted' || role === 'declined'
    });
    await modal.present();
    const result = await modal.onDidDismiss<{ accepted: boolean }>();
    if (result.data?.accepted) {
      this.acceptedUserId = userId;
      return 'accepted';
    }
    this.acceptedUserId = undefined;
    await this.users.logOut();
    return 'declined';
  }
}

export type TermsAccessDecision = 'accepted' | 'declined' | 'unavailable';
