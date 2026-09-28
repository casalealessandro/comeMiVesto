import { Component, inject, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController, NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { StaticPage } from 'src/app/service/interface/static-page-interface';
import { StaticPageService } from 'src/app/service/static-page.service';
import { UserService } from 'src/app/service/user.service';

export type TermsPageMode = 'view' | 'registration' | 'authenticated';

@Component({
  standalone: false,
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.page.html',
  styleUrls: ['./terms-conditions.page.scss'],
})
export class TermsConditionsPage implements OnInit, OnDestroy {
  @Input() mode: TermsPageMode = 'view';
  @ViewChild(IonContent, { static: false }) content: IonContent | undefined;

  page?: StaticPage;
  loading = false;
  error = '';
  isScrollAtBottom = false;
  accepting = false;

  modalController = inject(ModalController);
  private scrollElement?: HTMLElement;
  private readonly scrollHandler = (): void => {
    this.zone.run(() => this.updateScrollState());
  };

  get requiresAcceptance(): boolean { return this.mode !== 'view'; }

  constructor(
    private navController: NavController,
    private users: UserService,
    private staticPages: StaticPageService,
    private alerts: AlertController,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadTerms();
  }

  async ionViewDidEnter(): Promise<void> {
    await this.attachScrollListener();
  }

  ionViewWillLeave(): void {
    this.detachScrollListener();
  }

  ngOnDestroy(): void {
    this.detachScrollListener();
  }

  loadTerms(): void {
    this.loading = true;
    this.error = '';
    this.page = undefined;
    this.isScrollAtBottom = false;
    this.detachScrollListener();

    this.staticPages.getStaticPage('terms').subscribe({
      next: async (page) => {
        this.page = page;
        this.loading = false;
        await this.attachScrollListener();
      },
      error: (error) => {
        this.loading = false;
        this.error = error?.message || 'Impossibile caricare i Termini di Servizio.';
      }
    });
  }

  updateScrollState(): void {
    if (!this.requiresAcceptance || !this.scrollElement || !this.page) return;
    const { scrollTop, scrollHeight, clientHeight } = this.scrollElement;
    const tolerance = 4;
    this.isScrollAtBottom = scrollHeight <= clientHeight
      || scrollTop + clientHeight >= scrollHeight - tolerance;
  }

  private async attachScrollListener(): Promise<void> {
    this.detachScrollListener();
    if (!this.requiresAcceptance || !this.content || !this.page) return;
    try {
      this.scrollElement = await this.content.getScrollElement();
      this.scrollElement.addEventListener('scroll', this.scrollHandler, { passive: true });
      this.updateScrollState();
    } catch {
      this.detachScrollListener();
      this.isScrollAtBottom = false;
    }
  }

  private detachScrollListener(): void {
    this.scrollElement?.removeEventListener('scroll', this.scrollHandler);
    this.scrollElement = undefined;
  }

  async acceptAndContinue(): Promise<void> {
    if (!this.requiresAcceptance || !this.page || !this.isScrollAtBottom || this.accepting) return;
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

  async handleBackButton(): Promise<void> {
    if (this.requiresAcceptance) {
      await this.modalController.dismiss({ accepted: false }, 'declined');
      return;
    }

    const modal = await this.modalController.getTop();
    if (modal) {
      await modal.dismiss();
    } else {
      this.navController.back();
    }
  }
}
