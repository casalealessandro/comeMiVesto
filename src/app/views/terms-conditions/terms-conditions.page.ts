import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController, NavController } from '@ionic/angular';
import { UserService } from 'src/app/service/user.service';
import { firstValueFrom } from 'rxjs';

export type TermsPageMode = 'view' | 'registration' | 'authenticated';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.page.html',
  styleUrls: ['./terms-conditions.page.scss'],
})
export class TermsConditionsPage implements OnInit {
  @Input() mode: TermsPageMode = 'view';
  @ViewChild(IonContent, { static: false }) content: IonContent | undefined;
  isScrollAtBottom: boolean = false; // Flag per tenere traccia se l'utente ha raggiunto il fondo della pagina
  modalController = inject(ModalController)
  Data:any
  accepting = false;
  get requiresAcceptance(): boolean { return this.mode !== 'view'; }
  constructor(private navController: NavController, private users: UserService, private alerts: AlertController) { }

  ngOnInit() {  
    const da =  new Date()
    this.Data =`${da.getMonth() +1}/${da.getFullYear()}`
  }
  
  async ionViewDidEnter(): Promise<void> {
    if (this.requiresAcceptance) await this.updateScrollState();
  }

  async onScroll(event: CustomEvent<{ scrollTop: number }>): Promise<void> {
    await this.updateScrollState(event.detail.scrollTop);
  }

  async updateScrollState(scrollTop?: number): Promise<void> {
    if (!this.requiresAcceptance || !this.content) return;
    try {
      const scrollElement = await this.content.getScrollElement();
      const currentScrollTop = scrollTop ?? scrollElement.scrollTop;
      const tolerance = 4;
      this.isScrollAtBottom = scrollElement.scrollHeight <= scrollElement.clientHeight
        || currentScrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - tolerance;
    } catch {
      this.isScrollAtBottom = false;
    }
  }

  async acceptAndContinue(): Promise<void> {
    if (!this.requiresAcceptance || !this.isScrollAtBottom || this.accepting) return;
    if (this.mode === 'registration') {
      await this.modalController.dismiss({ accepted: true }, 'accepted');
      return;
    }
    this.accepting = true;
    try {
      await firstValueFrom(this.users.acceptTerms());
      await this.modalController.dismiss({ accepted: true }, 'accepted');
    } catch {
      const alert = await this.alerts.create({
        header: 'Accettazione non registrata',
        message: 'Non è stato possibile registrare l’accettazione dei Termini. Riprova.',
        buttons: ['Ok']
      });
      await alert.present();
    } finally {
      this.accepting = false;
    }
  }

  async decline(): Promise<void> {
    if (!this.requiresAcceptance) return;
    await this.modalController.dismiss({ accepted: false }, 'declined');
  }
  async handleBackButton() {
    if (this.requiresAcceptance) {
      await this.modalController.dismiss({ accepted: false }, 'declined');
      return;
    }
   
    // Altrimenti, esegui il comportamento predefinito del back button
    const modal = await this.modalController.getTop();
    if (modal) {
      // Se c'è un modale aperto, chiudi il modale
      modal.dismiss();
    } else {
      // Altrimenti, esegui il comportamento predefinito del back button
      this.navController.back();
    }
    
   }
}
