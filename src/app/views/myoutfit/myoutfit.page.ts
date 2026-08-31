import { Component, effect, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AlertController, ModalController, NavController, RefresherEventDetail } from '@ionic/angular';


import { AppService } from 'src/app/service/app-service';
import { buttons, filterItmClothing, outfit, OutfitFilterPayload, ReportReason, ReportType, seasons, Tag } from 'src/app/service/interface/outfit-all-interface';
import { ModalListComponent } from 'src/app/components/modal-list/modal-list.component';
import { UserService } from 'src/app/service/user.service';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { OutfitPreferencePayload, UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
import { FilterOutfitsPage } from '../filter-outfits/filter-outfits.page';
import { IonRefresherCustomEvent } from '@ionic/core';
import { DetailOutfitPage } from '../detail-outfit/detail-outfit.page';
import { Router } from '@angular/router';
import { SocialSharing } from 'src/app/service/social-sharing.service';
import { CategoryService } from 'src/app/service/category.service';

@Component({
  selector: 'app-myoutfit',
  templateUrl: './myoutfit.page.html',
  styleUrls: ['./myoutfit.page.scss'],
})
export class MyOutFitPage implements OnDestroy {


  outfits = this.appService.resultsSignal();
  trendingOutfits: outfit[] = []
  filteredOutfits: outfit[] = []; // Array per gli outfit filtrati
  isLoading: boolean = true;
  cUserID: string = '';
  cUserInfo: any  = this.userProfileService.gUserProfile();
  favorites: Set<string> = new Set();
  currentUserProfile$!: Observable<UserProfile | null>;
  outfitUserProfile$!: Observable<UserProfile>;
  outfitUserProfile!: UserProfile[];
  cUserPreference: UserPreference | null = null;
  isOutfitCompositionOpen: boolean = false;
  filtersData: OutfitFilterPayload = { categories: [], season: '', style: '' };
  searchText = '';
  private searchDebounce?: ReturnType<typeof setTimeout>;

  isFiltersSel: boolean = false
  backgroundImage: any = "url(assets/fallback-image.jpg);";

  segmentButtons = [
    {
      value: 'outfit',
      contentId: 'outfit',
      icon: 'fi fi-rs-hourglass-end',
      label: 'Ultimi outifit',

    },
    {
      value: 'suggeriti',
      contentId: 'suggeriti',
      icon: 'fi fi-rs-rocket-lunch',
      label: 'Suggeriti',

    },

  ];

  selectedSegment = 'outfit'; // Valore predefinito
  constructor(
    private router: Router,
    private appService: AppService,
    private afAuth: AngularFireAuth,
    private userProfileService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
    private sharingSocial: SocialSharing,
    private categoryService: CategoryService

  ) {

  }

  async ionViewWillEnter() {
    await this.refreshOutfitsFromServer();
  }

  async refreshOutfitsFromServer(): Promise<void> {
    this.isLoading = true;
    this.filteredOutfits = [];

    try {
      const cUserInfo = await this.getReadyUserProfile();

      if (!cUserInfo?.uid || !cUserInfo?.gender) {
        console.warn('Profilo utente non pronto: impossibile caricare gli outfit.');
        return;
      }
      this.categoryService.fetchCategories(null, cUserInfo.gender)
      this.cUserID = cUserInfo.uid
      const queryString = `gender=${encodeURIComponent(cUserInfo.gender)}`
      const outfits = await firstValueFrom(this.appService.getAll<outfit>('outfitsList', queryString));
      this.outfits = outfits ?? [];
      await this.loadOutfits();
    } catch (err) {
      console.error('Errore durante il caricamento degli outfit:', err);
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

  async filterOutfits() {
    const prod: any = this.appService.selectedProduct();

    const subCategories = prod.outfitSubCategory
    const color = prod.color;

    const queryString = `gender=${encodeURIComponent(this.cUserInfo().gender)}`;
    let filteredOutfits = await lastValueFrom(this.appService.getFilteredOutfits(queryString, {
      categories: [{ outfitSubCategory: subCategories, color }]
    }));

    this.filteredOutfits = JSON.parse(JSON.stringify(filteredOutfits));
    await this.heartIcon();
    filteredOutfits.forEach(async rr => {


      this.outfitUserProfile$ = this.appService.getUserProfilebyId(rr.userId);
      this.outfitUserProfile$.pipe(take(1)).subscribe((outfitUserProfile: UserProfile) => {

        this.outfitUserProfile[rr.userId] = outfitUserProfile
      })



    });
  }

  /*  ionViewWillEnter() {
     this.loadOutfits();
   } */

  async openFilterModal() {
    this.isFiltersSel = false
    const modal = await this.modalController.create({
      component: FilterOutfitsPage,
      componentProps: {
        currentFilterSel: this.filtersData

      }
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss<Partial<filterItmClothing>>();
    if (role === 'clear') {
      this.filtersData = { categories: [], season: '', style: '' };
      this.searchText = '';
      await this.applyOutfitFilters();
      return;
    }
    if (role !== 'apply' || !data) return;
    this.filtersData = {
      categories: this.normalizeCategories(data.categories),
      season: data.season ?? '',
      style: data.style ?? ''
    };
    await this.applyOutfitFilters();

  }

  onSearchInput(event: CustomEvent<{ value?: string | null }>): void {
    this.searchText = event.detail.value ?? '';
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => void this.applyOutfitFilters(), 350);
  }

  buildOutfitFilterPayload(): OutfitFilterPayload {
    return {
      categories: this.normalizeCategories(this.filtersData.categories),
      season: this.filtersData.season ?? '',
      style: this.filtersData.style ?? '',
      ...(this.searchText.trim() ? { search: this.searchText.trim() } : {})
    };
  }

  async applyOutfitFilters(): Promise<void> {
    this.selectedSegment = 'outfit';
    const profile = await this.getReadyUserProfile();
    if (!profile?.gender) {
      this.filteredOutfits = [];
      return;
    }
    this.isLoading = true;
    try {
      const queryString = `gender=${encodeURIComponent(profile.gender)}`;
      this.filteredOutfits = await firstValueFrom(
        this.appService.getFilteredOutfits(queryString, this.buildOutfitFilterPayload())
      ) ?? [];
    } catch (error) {
      console.error('Impossibile applicare i filtri outfit:', error);
      this.filteredOutfits = [];
    } finally {
      this.isLoading = false;
    }
  }

  private normalizeCategories(categories: OutfitFilterPayload['categories'] = []): NonNullable<OutfitFilterPayload['categories']> {
    return (categories ?? [])
      .map(({ outfitCategory, outfitSubCategory, color }) => ({ outfitCategory, outfitSubCategory, color }))
      .filter(category => Boolean(category.outfitCategory || category.outfitSubCategory || category.color));
  }

  ngOnDestroy(): void {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
  }


  filterOutfitds(outfits: any, filter: any) {
    const { categories, season, style } = filter;

    if (season != "") {
      // Filtra sulla stagione
      outfits = outfits.filter((outfit: any) => outfit.season === season);
    }
    if (style != "") {
      // Filtra sulla stagione
      outfits = outfits.filter((outfit: any) => outfit.style === style);
    }
    if (categories.length > 0) {
      // Filtra sulla categoria
      outfits = outfits.filter((outfit: any) => {
        console.log(outfit.id, this.filterTags(outfit.tags, categories))
        return this.filterTags(outfit.tags, categories);


        // Con la proprietà some verifico se almeno un elemento delle categorie e colore sono presenti nei mie tag dell'outfits
        const matchesCategories = categories.every((category: any) => {
          const { outfitSubCategory, color } = category;

          // Controlla ogni tag dell'outfit rispetto ai filtri
          return outfit.tags.every((tag: any) => {
            // Controlla se il colore corrisponde quando la sub-categoria è vuota
            /* if (!outfitSubCategory && color && tag.color === color) {
              return true;
            }

            // Controlla se la sub-categoria corrisponde quando il colore è vuoto
            if (!color && outfitSubCategory && tag.outfitSubCategory === outfitSubCategory) {
              return true;
            } */

            // Controlla se il colore e la sub-categoria corrispondono entrambi
            if ((color && outfitSubCategory) && (tag.outfitSubCategory === outfitSubCategory && tag.color === color)) {
              return true;
            }

            // Nessuna condizione soddisfatta
            return false
          });
        });

        return matchesCategories;
      });;
    }
    console.log('outfits', this.filteredOutfits);
    this.filteredOutfits = outfits

  };
  filterTags(tags: any[], categories: any[]): boolean {

    return categories.some((category: any) => {
      const { outfitSubCategory, color } = category;
      const checked = tags.filter((tag: any) => {
        return tag.outfitSubCategory == outfitSubCategory && tag.color == color;
      });
      console.log('ccccccc', checked)
      return checked.length > 0;
    });
  }
  /*  matchColorPreference(outfit: outfit) {
     return this.filtersColor.some(color => {

       const colors = color


       const matchesColor = outfit.tags.some((tag: any) => colors.includes(tag.color));

       // Restituisce true se almeno una delle preferenze corrisponde all'outfit
       return matchesColor
     });
   } */

  async showOutfitComposition(tags: any) {

    // Verifica se il modale è già aperto
    if (this.isOutfitCompositionOpen) {
      return; // Evita di aprire un altro modale se uno è già aperto
    }

    // Imposta la variabile a true quando il modale viene aperto
    this.isOutfitCompositionOpen = true;

    const modal = await this.modalController.create({
      component: ModalListComponent,
      componentProps: {
        items: tags, // Array degli elementi da visualizzare
        title: 'Elenco elementi outfit', // Titolo della lista
        displayExpr: 'name',
        optionbuttonsItem: <buttons><unknown>[
          {
            icon: 'save-outline',
            text: '',
            actionName: 'saveInCloset'
          }
        ]

      },
      initialBreakpoint: 0.45,
      breakpoints: [0.70, 0.99],
      backdropDismiss: false,
      backdropBreakpoint: 0.5
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('Modal data:', data);
    this.isOutfitCompositionOpen = false
    let nameEv = data.name;
    let item = data.item;
    let category = !item.outfitCategory ? '' : item.outfitCategory
    let subCategory = !item.outfitSubCategory ? '' : item.outfitSubCategory
    switch (nameEv) {
      case
        "saveInCloset":
        let data = {
          name: item.name,
          outfitCategory: category,
          outfitSubCategory: subCategory,
          brend: '',
          images: []

        }
        let res = await this.appService.createWardrobe(data)

        if (res) {
          const alert = await this.alertController.create({
            header: 'Oggetto salvato',
            message: `${item.name} salvato nel tuo guardaroba`,
            buttons: ['Ok'],
          });

          await alert.present();
        }
        break;

      default:
        break;
    }
  }


  async loadOutfits(): Promise<void> {
    this.cUserPreference = await this.userProfileService.getUserPreference();
    this.filteredOutfits = JSON.parse(JSON.stringify(this.outfits));
    this.outfitUserProfile = [];
    await this.heartIcon();
    this.outfits.forEach(rr => {
      this.outfitUserProfile$ = this.appService.getUserProfilebyId(rr.userId);
      this.outfitUserProfile$.pipe(take(1)).subscribe((profile: UserProfile) => {
        this.outfitUserProfile[rr.userId] = profile;
      });
    });
    this.getTrendingOutfits();
  }


  async getTrendingOutfits() {

    // Ottieni la data di oggi
    const today = new Date();

    // Calcola la data di una settimana fa
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    // Ottieni il timestamp della data di una settimana fa
    const timestampOneWeekAgo = oneWeekAgo.getTime();

    const response: any = await this.appService.getData('outfitsList', 'page=1&limit=100')
    const outfits = Array.isArray(response) ? response : response.outfits ?? [];
    const trendingOutfits = outfits
      .filter((outfit: outfit) => !outfit.createdAt || outfit.createdAt >= timestampOneWeekAgo)
      .sort((a: outfit, b: outfit) => (b.visits ?? 0) - (a.visits ?? 0) || (a.likes ?? 0) - (b.likes ?? 0));
    if (trendingOutfits)
      this.trendingOutfits = trendingOutfits
  }

  async filterUserOutFit() {
    const profile = await this.getReadyUserProfile();
    if (!profile?.gender) {
      this.filteredOutfits = [];
      return;
    }
    const payload: OutfitPreferencePayload = this.userProfileService.toOutfitPreferencePayload(this.cUserPreference);
    this.isLoading = true;
    try {
      const queryString = `gender=${encodeURIComponent(profile.gender)}`;
      this.filteredOutfits = await firstValueFrom(this.appService.getSuggestOutfits(queryString, payload)) ?? [];
    } catch (error) {
      console.error('Impossibile caricare gli outfit suggeriti:', error);
      this.filteredOutfits = [];
    } finally {
      this.isLoading = false;
    }


  }

  async outfitMenu(outfit: outfit) {

    this.modalController.dismiss()


    // Imposta la variabile a true quando il modale viene aperto
    this.isOutfitCompositionOpen = true;
    let itemsElement = [
      {
        id: "segnalaUtente",
        title: "Segnala l'utente",
        icon: 'alert'
      },
      {
        id: "segnalaContenuto",
        title: "Segnala outfit",
        icon: 'flag'
      },
      {
        id: "bloccaUtente",
        title: "Blocca utente",
        icon: 'eye-off-outline'
      }
    ]
    const modal = await this.modalController.create({
      component: ModalListComponent,
      componentProps: {
        items: itemsElement, // Array degli elementi da visualizzare
        title: 'Segnalazioni', // Titolo della lista
        displayExpr: 'title',


      },
      initialBreakpoint: 0.45,
      breakpoints: [0.70, 0.99],
      backdropDismiss: false,
      backdropBreakpoint: 0.5
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('Modal data:', data);

    const id = data?.id;

    if (id === 'bloccaUtente') {
      await this.blockOutfitUser(outfit);
      return;
    }

    if (this.cUserID === outfit.userId || (id !== 'segnalaUtente' && id !== 'segnalaContenuto')) {
      this.isOutfitCompositionOpen = false;
      return;
    }
    const reason = await this.selectReportReason();
    if (!reason) {
      this.isOutfitCompositionOpen = false;
      return;
    }

    const dataS = {
      outFitId: String(outfit.id),
      typeSegnaletion: id as ReportType,
      reason
    }
    try {
      await this.appService.createReport(dataS)
      this.isOutfitCompositionOpen = false;
      const alert = await this.alertController.create({
        header: 'Segnalazione completata',
        message: `Ti ringraziamo per la segnalazione, prenderemo in esame la tua richiesta`,
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

  async blockOutfitUser(outfit: outfit): Promise<void> {
    if (this.cUserID === outfit.userId) {
      this.isOutfitCompositionOpen = false;
      return;
    }
    try {
      await this.appService.blockUser(String(outfit.userId));
      this.isOutfitCompositionOpen = false;
      await this.refreshOutfitsFromServer();
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
    const modal = await this.modalController.create({ component: ModalListComponent, componentProps: { items, title: 'Motivo della segnalazione', displayExpr: 'title' } });
    await modal.present();
    const { data } = await modal.onDidDismiss<{ id: ReportReason }>();
    return data?.id ?? null;
  }

  private async presentReportAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ header, message, buttons: ['Ok'] });
    await alert.present();
  }

  async openShareModal(outfit: outfit) {


    this.sharingSocial.shareVia(outfit)
    /*  const modal = await this.modalController.create({
       component: SocialSharingComponent,
       componentProps: { outfit: outfit },
       initialBreakpoint: 0.45,
       breakpoints: [0.70, 0.99],
       backdropDismiss: false,
       backdropBreakpoint: 0.5,
       presentingElement: await this.modalController.getTop(),
     });
     await modal.present(); */
  }

  matchesPreferences(outfit: any): boolean {
    // Logica per confrontare l'outfit con le preferenze dell'utente
    // Se userPreferences non è definito o è un array vuoto, restituisci true per mostrare tutti gli outfit
    if (!this.cUserPreference) {
      return true;
    }
    return false
    // Scorri l'array userPreferences e controlla se l'outfit corrisponde a una delle preferenze


    /*const colors = this.cUserPreference.color || [];
    const brend = this.cUserPreference.brend || [];

    const matchesColor = !this.cUserPreference.color || this.cUserPreference.color.length === 0 || outfit.tags.some((tag: any) => colors.includes(tag.color));
    const matchesStyle = !this.cUserPreference.style || this.cUserPreference.style.length === 0 || this.cUserPreference.style.includes(outfit.style);
    const matchesbrend = !this.cUserPreference.brend || this.cUserPreference.brend.length === 0 || outfit.tags.some((tag: any) => brend.includes(tag.brend));


    return matchesColor || matchesStyle || matchesbrend;
  */
  }

  async addFavoriteOutfit(outfit: any) {


    let likes = outfit.likes
    if (this.favorites.has(outfit.id)) {
      const outfitId = outfit.id;
      this.userProfileService.delFaveUserOutfits(outfitId).subscribe(faveUserOutfits => {
        this.favorites.delete(outfit.id);
      })

      return;

    }

    this.userProfileService.saveFaveUserOutfits(outfit.id).subscribe(res=>{
      if (res) {

        this.favorites.add(outfit.id);

        if (this.cUserID == outfit.userId) {
          return;
        }

      }
    })


  }

  async heartIcon() {


    this.userProfileService.loadFaveUserOutfits()
      .subscribe(async faveUserOutfits => {

        this.favorites.clear();
        faveUserOutfits.forEach(fUserOutfits => {
          this.favorites.add(fUserOutfits.outfitId);
        })
      })



    //    console.log(this.favorites)


  }

  isFavorite(outfitId: string): boolean {
    // Verifica se l'outfitId è presente nel set dei preferiti
    return this.favorites.has(outfitId);
  }

  async hasOutfitVisitFull(outfit: outfit) {
    if (outfit.tags.length == 0) {
      return
    }
    this.router.navigate(['tabs/detail-outfit', outfit.id]).then(async res => {


      if (outfit.userId == this.cUserID) {
        return
      }
      await this.appService.recordOutfitVisit(String(outfit.id));
    })
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const scrollTop = (event.target as Document).documentElement.scrollTop;
    const scrollHeight = (event.target as Document).documentElement.scrollHeight;
    const clientHeight = (event.target as Document).documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 10 && !this.isLoading) {
      this.loadOutfits();
    }
  }

  applyFilters(filters?: null | undefined) {
    this.loadOutfits();
  }


  onSegmentChange(event: CustomEvent) {
    const selectedSegment = event.detail.value; // Valore del pulsante selezionato
    this.selectedSegment = event.detail.value; // Valore del pulsante selezionato
    switch (selectedSegment) {
      case 'outfit':
        this.loadOutfits();
        break;
      case 'suggeriti':
        this.filterUserOutFit();
        break;
      default:
        break;
    }
  }
}
