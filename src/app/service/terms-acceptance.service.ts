import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { TermsConditionsPage } from '../views/terms-conditions/terms-conditions.page';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class TermsAcceptanceService {
  private activeCheck?: Promise<boolean>;
  constructor(private users: UserService, private modals: ModalController, private router: Router, private alerts: AlertController) {}

  async allowAppAccess(): Promise<boolean> {
    if (this.activeCheck) return this.activeCheck;
    this.activeCheck = this.checkTerms().catch(async () => {
      const alert = await this.alerts.create({
        header: 'Verifica dei Termini non riuscita',
        message: 'Impossibile verificare l’accettazione dei Termini. Controlla la connessione e riprova.',
        buttons: ['Ok']
      });
      await alert.present();
      return false;
    });
    try {
      return await this.activeCheck;
    } finally {
      this.activeCheck = undefined;
    }
  }

  private async checkTerms(): Promise<boolean> {
    const status = await firstValueFrom(this.users.getTermsStatus());
    if (status.accepted) return true;
    const modal = await this.modals.create({
      component: TermsConditionsPage,
      componentProps: { acceptanceMode: true },
      backdropDismiss: false
    });
    await modal.present();
    const result = await modal.onDidDismiss<{ accepted: boolean }>();
    if (result.data?.accepted) return true;
    await this.users.logOut();
    await this.router.navigateByUrl('/login');
    return false;
  }
}
