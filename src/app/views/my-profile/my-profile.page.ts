import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, OnInit } from '@angular/core';
import { finalize, firstValueFrom, Observable } from 'rxjs';
import { UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
import { UserService } from 'src/app/service/user.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { outfit, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AddOutfitPage } from '../add-outfit/add-outfit.page';
import { Router } from '@angular/router';
import { ApiRequestError, AppService } from 'src/app/service/app-service';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { TermsAcceptanceService } from 'src/app/service/terms-acceptance.service';
import { PreferencesOnboardingComponent } from 'src/app/components/preferences-onboarding/preferences-onboarding.component';
@Component({
  standalone: false,
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],


})
export class MyProfilePage implements OnInit {

  outfitNumber: number = 0;
  isLoading: boolean = true;

  userProfile$ = this.userProfileService.gUserProfile();
  userOutfits$!: Observable<outfit[]>;
  userWardrobes$!: Observable<wardrobesItem[]>;
  faveUserOutfits$ = this.userProfileService.getFaveUserOutfits();
  faveUserOutfitsNumber$ = this.userProfileService.getNumberFaveUserOutfitsNumber();
  userOutfits!: outfit[];
  wardrobesNumber: number = 0;
  userWardrobes!: wardrobesItem[];

  //faveUserOutfits!: any[];

  uid: string | undefined;
  userPreference!: UserPreference | null;
  segmentButtons = [
    {
      value: 'outfit',
      contentId: 'outfit',
      icon: 'fi fi-rr-magic-wand',
      label: 'Outfit creati',
      number: 42, // Sostituisci con la variabile dinamica outfitNumber
    },
    {
      value: 'wardrobes',
      contentId: 'wardrobes',
      icon: 'fi fi-rr-shirt',
      label: 'Vestiti nell\'armadio',
      number: 120, // Sostituisci con la variabile dinamica wardrobesNumber
    },
    {
      value: 'fave',
      contentId: 'fave',
      icon: 'fi fi-rr-heart',
      label: 'Desiderati',
      number: 15, // Sostituisci con la variabile dinamica faveUserOutfitsNumber
    },
  ];

  selectedSegment = 'outfit'; // Valore predefinito
  private isProfilePictureChanging = false;
  private isEditProfileModalOpen = false;
  private isPreferenceModalOpen = false;
  private isEditOutfitModalOpen = false;
  private deletionsInProgress = new Set<string>();


  constructor(
    private userProfileService: UserService,
    private appService: AppService,
    private navController: NavController,
    private modalController: ModalController,
    private alert: AlertController,
    private sharedData: SharedDataService,
    private termsAcceptance: TermsAcceptanceService,
    private router: Router) {

       // Effetto per ascoltare i cambiamenti
          effect(() => {
            console.log('Outfit preferiti aggiornati:', this.faveUserOutfits$());
            const favoritesNumber = this.faveUserOutfitsNumber$();
            this.segmentButtons[2].number = favoritesNumber;
            console.log('N.Outfit preferiti aggiornati:', favoritesNumber);
          });
    }

  async ngOnInit() {

    //this.userProfile$ = this.userProfileService.getUserProfile();
    this.userPreference = this.userProfileService.gUserPreference()();



    this.uid = this.userProfile$()?.uid;

    this.isLoading = true;
    try {
      await Promise.all([this.loadUserOutfits(), this.loadUserWardrobes(), this.loadFavoriteOutfits()]);
      this.faveUserOutfits$ = this.userProfileService.getFaveUserOutfits();
    } finally {
      this.isLoading = false;
    }
  }

  async loadUserOutfits(): Promise<void> {
    this.userOutfits$ = this.userProfileService.getUserOutfits();
    this.userOutfits = await firstValueFrom(this.userOutfits$);
    this.outfitNumber = this.userOutfits.length;
    this.segmentButtons[0].number = this.outfitNumber;
  }

  async loadUserWardrobes(): Promise<void> {
    this.userWardrobes$ = this.userProfileService.getUserWardrobes();
    this.userWardrobes = await firstValueFrom(this.userWardrobes$);
    this.wardrobesNumber = this.userWardrobes.length;
    this.segmentButtons[1].number = this.wardrobesNumber;
  }

  async loadFavoriteOutfits(): Promise<void> {
    const favorites = await firstValueFrom(this.userProfileService.loadFaveUserOutfits());
    this.segmentButtons[2].number = favorites.length;
  }

  openMenu() {
    throw new Error('Method not implemented.');
  }
  async handleBackButton() {
    // Controlla se la pagina è aperta in un modale
    const modal = await this.modalController.getTop();
    if (modal) {
      // Se c'è un modale aperto, chiudi il modale
      modal.dismiss();
    } else {
      // Altrimenti, esegui il comportamento predefinito del back button
      this.navController.back();
    }
  }
  async changeProfilePicture() {
    if (this.isProfilePictureChanging) return;
    this.isProfilePictureChanging = true;
    try {
      const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelPhoto: 'Seleziona dalla galleria ',
      promptLabelPicture: 'Scatta una foto',
      promptLabelCancel: 'Cancella',
    });

    if (image && image.dataUrl) {
      this.userProfileService.updateProfilePicture(image.dataUrl)
        .then(() => console.log('Profile picture updated'))
        .catch((error: ApiRequestError) => void this.presentProfileError(error, true))
        .finally(() => this.isProfilePictureChanging = false);
      return;
      }
      this.isProfilePictureChanging = false;
    } catch (error) {
      this.isProfilePictureChanging = false;
      throw error;
    }
  }

  async editProfile() {
    if (this.isEditProfileModalOpen) return;
    this.isEditProfileModalOpen = true;
    try {
      const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'profileForm',
        editData: this.userProfile$()
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data.email != this.userProfile$()!.email) {
      this.alert.create({
        header: 'Attenzione!',
        message: `Non è possibile cambiare email, pertanto l'email non verrà sostiuita`,
        buttons: ['Ok'],
      })
    }

    let displayName = !data.displayName ? `${data.name} ${data.cognome}` : data.displayName
    let bio = !data.bio ? '' : data.bio;
    let nome = data.nome || data.name || '';

    let profileData: Partial<UserProfile> = {
      displayName: displayName,
      cognome: data.cognome,
      nome: nome,
      bio: bio,
      gender: data.gender,
    }
    this.userProfileService.updateUserProfile(this.uid || '', profileData).subscribe({ next: data => {
      const isOk = data ? true : false;
      if (isOk) {
        this.alert.create({
          header: 'Attenzione!',
          message: `Profilo aggiornato`,
          buttons: ['Ok'],
        })
        //this.userProfile = profileData;
      }
    }, error: (error: ApiRequestError) => void this.presentProfileError(error) });
    } finally {
      this.isEditProfileModalOpen = false;
    }
  }

  async editUserPreference() {
    if (this.isPreferenceModalOpen) return;
    this.isPreferenceModalOpen = true;
    try {
      const modal = await this.modalController.create({
      component: PreferencesOnboardingComponent,
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'complete') {
        this.userPreference = this.userProfileService.gUserPreference()();
      }
    } finally {
      this.isPreferenceModalOpen = false;
    }
  }
  async presentProfileError(error: ApiRequestError, picture = false): Promise<void> {
    if (error.code === 'TERMS_ACCEPTANCE_REQUIRED') {
      const decision = await this.termsAcceptance.allowAppAccess();
      if (decision === 'declined') {
        await this.router.navigateByUrl('/login');
        return;
      }
      if (decision === 'accepted') {
        const alert = await this.alert.create({
          header: 'Termini aggiornati',
          message: 'I Termini ora risultano accettati. Riprova l’aggiornamento del profilo.',
          buttons: ['Ok']
        });
        await alert.present();
      }
      return;
    }
    const message = this.getProfileErrorMessage(error, picture);
    const alert = await this.alert.create({ header: 'Aggiornamento non completato', message, buttons: ['Ok'] });
    await alert.present();
  }
  getProfileErrorMessage(error: ApiRequestError, picture = false): string {
    return error.code === 'CONTENT_FLAGGED'
      ? (picture ? 'La foto profilo scelta non può essere utilizzata.' : 'Il nome pubblico scelto non può essere utilizzato. Modificalo e riprova.')
      : error.code === 'MODERATION_UNAVAILABLE'
        ? 'Il controllo dei contenuti non è temporaneamente disponibile. Riprova tra poco.'
        : 'Non è stato possibile aggiornare il profilo. Riprova.';
  }
  async openEditOutfit(outfitData: outfit) {
    //usersPreferenceForm

    if (this.isEditOutfitModalOpen) return;
    this.isEditOutfitModalOpen = true;
    try {
      const modal = await this.modalController.create({
      component: AddOutfitPage,
      componentProps: {
        isEditMode: true,
        outfitData: outfitData,
        showheader: true

      }
    });
    await modal.present();

      const { data } = await modal.onDidDismiss();
    } finally {
      this.isEditOutfitModalOpen = false;
    }
  }
  async deleteOutfit(event: any, outfitData: outfit) {

    event.stopPropagation();
    event.preventDefault();

    const lockId = `outfit:${outfitData.id}`;
    if (this.deletionsInProgress.has(lockId)) return;
    this.deletionsInProgress.add(lockId);
    try {
      const confirmed = await this.confirmRemoval(
      'Elimina outfit',
      outfitData?.title
        ? `Vuoi eliminare "${outfitData.title}"?`
        : 'Vuoi eliminare questo outfit?',
      'Elimina'
    );
    if (!confirmed) {
        return;
    }

    const res = await this.appService.deleteOutfit(String(outfitData.id));
    if (res) {
        await this.loadUserOutfits();
      }
    } finally {
      this.deletionsInProgress.delete(lockId);
    }


  }

  async deletewardrobesitem(event: any, wardrobesItem: wardrobesItem) {

    event.stopPropagation();
    event.preventDefault();

    const lockId = `wardrobe:${wardrobesItem.id}`;
    if (this.deletionsInProgress.has(lockId)) return;
    this.deletionsInProgress.add(lockId);
    try {
      const confirmed = await this.confirmRemoval(
      'Rimuovi prodotto',
      wardrobesItem?.name
        ? `Vuoi rimuovere "${wardrobesItem.name}" dal tuo armadio?`
        : 'Vuoi rimuovere questo prodotto dal tuo armadio?',
      'Rimuovi'
    );
    if (!confirmed) {
        return;
    }

    const res = await this.appService.deleteWardrobe(String(wardrobesItem.id));
    if (res) {
        await this.loadUserWardrobes();
      }
    } finally {
      this.deletionsInProgress.delete(lockId);
    }


  }
  async deleteFaveOutfit(event: any, faveItem: any) {

    event.stopPropagation();
    event.preventDefault();

    const lockId = `favorite:${faveItem.outfitId}`;
    if (this.deletionsInProgress.has(lockId)) return;
    this.deletionsInProgress.add(lockId);
    let confirmed: boolean;
    try {
      confirmed = await this.confirmRemoval(
      'Rimuovi dai desiderati',
      faveItem?.title
        ? `Vuoi rimuovere "${faveItem.title}" dai desiderati?`
        : 'Vuoi rimuovere questo outfit dai desiderati?',
      'Rimuovi'
    );
    } catch (error) {
      this.deletionsInProgress.delete(lockId);
      throw error;
    }
    if (!confirmed) {
      this.deletionsInProgress.delete(lockId);
      return;
    }

    this.userProfileService.delFaveUserOutfits(faveItem.outfitId)
    .pipe(finalize(() => this.deletionsInProgress.delete(lockId)))
    .subscribe(res => {
      if (res) {
        this.segmentButtons[2].number = res.length;
      }
    });
  }

  private async confirmRemoval(header: string, message: string, confirmText: string): Promise<boolean> {
    const alert = await this.alert.create({
      header,
      message,
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { text: confirmText, role: 'confirm' }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }


  // Funzione per gestire l'evento di cambio segmento
  onSegmentChange(event: CustomEvent) {
    this.selectedSegment = event.detail.value; // Valore del pulsante selezionato

  }
}
