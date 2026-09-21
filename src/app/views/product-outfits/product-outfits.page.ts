import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ModalListComponent } from 'src/app/components/modal-list/modal-list.component';
import { AppCatalogProduct, AppService } from 'src/app/service/app-service';
import { outfit, ReportReason, ReportType } from 'src/app/service/interface/outfit-all-interface';
import { PublicUserProfile, UserProfile } from 'src/app/service/interface/user-interface';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { SocialSharing } from 'src/app/service/social-sharing.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  standalone: false,
  selector: 'app-product-outfits',
  templateUrl: './product-outfits.page.html',
  styleUrls: ['../myoutfit/myoutfit.page.scss'],
})
export class ProductOutfitsPage implements OnInit {
  product?: AppCatalogProduct;
  filteredOutfits: outfit[] = [];
  isLoading = true;
  cUserID = '';
  favorites: Set<string> = new Set();
  outfitUserProfile: PublicUserProfile[] = [];
  isOutfitCompositionOpen = false;
  cUserInfo: any = this.userProfileService.gUserProfile();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    private userProfileService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
    private sharingSocial: SocialSharing,
    private sharedData: SharedDataService
  ) {}

  ngOnInit(): void {
    this.sharedData.setData({
      componentName: 'HeaderComponent',
      data: {
        showLogo: false,
        showUserInfo: false,
        titleText: 'Outfit',
        showTitleText: true,
        canGoBack: true
      }
    });
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadOutfitMatches();
  }

  async loadOutfitMatches(): Promise<void> {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.filteredOutfits = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.filteredOutfits = [];
    this.outfitUserProfile = [];

    try {
      const profile = await this.getReadyUserProfile();
      if (!profile?.uid || !profile?.gender) {
        return;
      }

      this.cUserID = profile.uid;
      this.product = await this.appService.getOutfitProduct(productId);

      const queryString = `gender=${encodeURIComponent(profile.gender)}`;
      this.filteredOutfits = await firstValueFrom(
        this.appService.getFilteredOutfits(queryString, {
          categories: [{
            outfitCategory: this.product.outfitCategory,
            outfitSubCategory: this.product.outfitSubCategory,
            color: this.product.color
          }]
        })
      ) ?? [];

      if (!this.filteredOutfits.length) {
        return;
      }

      await this.heartIcon();

      await Promise.all(
        this.filteredOutfits.map(async currentOutfit => {
          const profile = await firstValueFrom(this.appService.getUserProfilebyId(currentOutfit.userId));
          this.outfitUserProfile[currentOutfit.userId] = profile;
        })
      );
    } catch (error) {
      console.error('Impossibile caricare gli outfit abbinati al prodotto:', error);
      this.filteredOutfits = [];
    } finally {
      this.isLoading = false;
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    }
  }

  private async getReadyUserProfile(): Promise<UserProfile | null> {
    this.cUserInfo = this.userProfileService.gUserProfile();

    let cUserInfo = this.cUserInfo();
    if (cUserInfo?.uid && cUserInfo?.gender) {
      return cUserInfo;
    }

    const isUserLoaded = await this.userProfileService.loadUser();
    cUserInfo = this.cUserInfo();

    if (!isUserLoaded || !cUserInfo?.uid || !cUserInfo?.gender) {
      return null;
    }

    return cUserInfo;
  }

  async outfitMenu(currentOutfit: outfit): Promise<void> {
    this.isOutfitCompositionOpen = true;
    const itemsElement = [
      {
        id: 'segnalaUtente',
        title: "Segnala l'utente",
        icon: 'alert'
      },
      {
        id: 'segnalaContenuto',
        title: 'Segnala outfit',
        icon: 'flag'
      },
      {
        id: 'bloccaUtente',
        title: 'Blocca utente',
        icon: 'eye-off-outline'
      }
    ];

    const modal = await this.modalController.create({
      component: ModalListComponent,
      componentProps: {
        items: itemsElement,
        title: 'Segnalazioni',
        displayExpr: 'title'
      },
      initialBreakpoint: 0.45,
      breakpoints: [0.70, 0.99],
      backdropDismiss: false,
      backdropBreakpoint: 0.5
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    const id = data?.id;

    if (id === 'bloccaUtente') {
      await this.blockOutfitUser(currentOutfit);
      return;
    }

    if (this.cUserID === currentOutfit.userId || (id !== 'segnalaUtente' && id !== 'segnalaContenuto')) {
      this.isOutfitCompositionOpen = false;
      return;
    }

    const reason = await this.selectReportReason();
    if (!reason) {
      this.isOutfitCompositionOpen = false;
      return;
    }

    const dataS = {
      outFitId: String(currentOutfit.id),
      typeSegnaletion: id as ReportType,
      reason
    };

    try {
      await this.appService.createReport(dataS);
      this.isOutfitCompositionOpen = false;
      const alert = await this.alertController.create({
        header: 'Segnalazione completata',
        message: 'Ti ringraziamo per la segnalazione, prenderemo in esame la tua richiesta',
        buttons: ['Ok'],
      });
      await alert.present();
    } catch (error: any) {
      this.isOutfitCompositionOpen = false;
      if (error?.status === 409) {
        const alert = await this.alertController.create({
          header: 'Segnalazione già inviata',
          message: 'Hai già inviato questa segnalazione.',
          buttons: ['Ok'],
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: 'Errore',
          message: error?.message || 'Si è verificato un errore imprevisto.',
          buttons: ['Ok'],
        });
        await alert.present();
      }
    }
  }

  async blockOutfitUser(currentOutfit: outfit): Promise<void> {
    if (this.cUserID === currentOutfit.userId) {
      this.isOutfitCompositionOpen = false;
      return;
    }

    try {
      await this.appService.blockUser(String(currentOutfit.userId));
      this.isOutfitCompositionOpen = false;
      await this.loadOutfitMatches();
    } catch (error: any) {
      this.isOutfitCompositionOpen = false;
      await this.presentReportAlert('Errore', error?.message || 'Non è stato possibile bloccare l’utente.');
    }
  }

  private async selectReportReason(): Promise<ReportReason | null> {
    const items: Array<{ id: ReportReason; title: string }> = [
      { id: 'contenutoInappropriato', title: 'Contenuto inappropriato' },
      { id: 'nuditaContenutoSessuale', title: 'Nudità o contenuto sessuale' },
      { id: 'violenza', title: 'Violenza' },
      { id: 'odioMolestie', title: 'Odio o molestie' },
      { id: 'spam', title: 'Spam' },
      { id: 'altro', title: 'Altro' }
    ];

    const modal = await this.modalController.create({
      component: ModalListComponent,
      componentProps: {
        items,
        title: 'Motivo della segnalazione',
        displayExpr: 'title'
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<{ id: ReportReason }>();
    return data?.id ?? null;
  }

  private async presentReportAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Ok']
    });
    await alert.present();
  }

  async openShareModal(currentOutfit: outfit): Promise<void> {
    await this.sharingSocial.shareVia(currentOutfit);
  }

  async addFavoriteOutfit(currentOutfit: outfit): Promise<void> {
    if (this.favorites.has(currentOutfit.id)) {
      this.userProfileService.delFaveUserOutfits(currentOutfit.id).subscribe(() => {
        this.favorites.delete(currentOutfit.id);
      });
      return;
    }

    this.userProfileService.saveFaveUserOutfits(currentOutfit.id).subscribe(res => {
      if (res) {
        this.favorites.add(currentOutfit.id);
      }
    });
  }

  async heartIcon(): Promise<void> {
    const faveUserOutfits = await firstValueFrom(this.userProfileService.loadFaveUserOutfits());
    this.favorites.clear();
    faveUserOutfits.forEach(fUserOutfit => {
      this.favorites.add(fUserOutfit.outfitId);
    });
  }

  isFavorite(outfitId: string): boolean {
    return this.favorites.has(outfitId);
  }

  async hasOutfitVisitFull(currentOutfit: outfit): Promise<void> {
    if (currentOutfit.tags.length === 0) {
      return;
    }

    this.router.navigate(['tabs/detail-outfit', currentOutfit.id]).then(async () => {
      if (currentOutfit.userId === this.cUserID) {
        return;
      }
      await this.appService.recordOutfitVisit(String(currentOutfit.id));
    });
  }

  openUserProfile(userId: string): void {
    const destination = userId === this.cUserID
      ? ['/tabs/my-profile']
      : ['/tabs/user-profile', userId];

    void this.router.navigate(destination);
  }
}
