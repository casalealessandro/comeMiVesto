import { Component, effect, HostListener, inject, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AlertController, ModalController, NavController, RefresherEventDetail } from '@ionic/angular';


import { AppService } from 'src/app/service/app-service';
import { buttons, FireBaseConditions, FireBaseOrderBy, outfit, seasons, Tag } from 'src/app/service/interface/outfit-all-interface';
import { ModalListComponent } from 'src/app/components/modal-list/modal-list.component';
import { UserService } from 'src/app/service/user.service';
import { Observable } from 'rxjs';
import { UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
import { FilterOutfitsPage } from '../filter-outfits/filter-outfits.page';
import { IonRefresherCustomEvent } from '@ionic/core';
import { DetailOutfitPage } from '../detail-outfit/detail-outfit.page';
import { Router } from '@angular/router';
import { SocialSharing } from 'src/app/service/social-sharing.service';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { CategoryService } from 'src/app/service/category.service';

@Component({
  selector: 'app-myoutfit',
  templateUrl: './myoutfit.page.html',
  styleUrls: ['./myoutfit.page.scss'],
})
export class MyOutFitPage  {


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
  cUserPreference: Partial<UserPreference> | null = null;
  isOutfitCompositionOpen: boolean = false;
  currentFilterSel: any;
  filtersData: any;

  isFiltersSel: boolean = false
  backgroundImage: any = "url(assets/fallback-image.jpg);";
  blockedUIDs: any = [];

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
    private categoryService: CategoryService,
    private sharedDataService: SharedDataService

  ) {

  }

  ionViewWillEnter() {

   
    
    this.cUserInfo = this.userProfileService.gUserProfile();
    
    const cUserInfo =this.cUserInfo()
   
    
    this.categoryService.fetchCategories(null, cUserInfo.gender)
    this.cUserID = cUserInfo.uid

    this.isLoading = true;
    let queryString = `gender=${cUserInfo.gender}`
    this.appService.getAll('outfitsList', queryString).subscribe(
      {
        next: (data) => {
          this.outfits = data; // Il segnale verrà aggiornato qui

          this.loadOutfits();  // Carica gli outfit solo se l'utente è loggato
        },
        error: (err) => {
          //this.error = err.message;
          // this.loading = false;
        },
      }
    )

    // this.loadOutfits();

  }

  async filterOutfits() {
    const prod: any = this.appService.selectedProduct();

    const subCategories = prod.outfitSubCategory
    const color = prod.color;

    let condition: FireBaseConditions[] = [
      {
        field: 'outfitSubCategory',
        operator: 'array-contains-any',
        value: subCategories
      },
      {
        field: 'color',
        operator: 'array-contains-any',
        value: [color]
      },
      {
        field: 'status',
        operator: '==',
        value: 'approved'
      }
    ]

    let filteredOutfits = await this.appService.getMultiFiltered('outfits', condition);

    const filteredData = filteredOutfits.filter(item => {
      // Verifica se blockedUIDs è definito e contiene effettivamente un array
      if (!Array.isArray(this.blockedUIDs)) {
        this.blockedUIDs = []; // Inizializza come array vuoto se è undefined
      }
      // Verifica che l'oggetto non contenga nessun UID in `uIdBlocked` o che non ci sia `uid` specificato
      return !item.userId || !this.blockedUIDs.includes(item.userId);
    });
    this.filteredOutfits = JSON.parse(JSON.stringify(filteredData));
    await this.heartIcon();
    filteredData.forEach(async rr => {
      

      this.outfitUserProfile$ = this.appService.getUserProfilebyId(rr.userId);
      this.outfitUserProfile$.subscribe((outfitUserProfile: UserProfile) => {

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


    this.sharedDataService.staredData$.subscribe(res => {

      const fData = this.sharedDataService.data().filter(data => data.componentName === "FilterOutfitsPage");

      this.filtersData = []
      const data = fData[0].data;
      this.filtersData = data;
      this.filtersData.categories = this.filtersData.categories.filter((reee: any) => reee.outfitSubCategory != "" && reee.color != "");


      let queryString = `gender=${this.cUserInfo().gender}`;

      this.appService.getFilteredOutfits(queryString, this.filtersData).subscribe((outfits) => {
        console.log('getFilteredOutfits--->', outfits);
        this.filteredOutfits = outfits;


      });

    })

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
          id: item.id,
          userId: this.cUserID,
          name: item.name,
          outfitCategory: category,
          outfitSubCategory: subCategory,
          brend: '',
          immages: []

        }
        let coditions = [

          {
            field: 'userId', operator: '==', value: this.cUserID
          },
          {
            field: 'id', operator: '==', value: item.id
          }
        ]

        let check = await this.appService.getFilteredCollection('wardrobes', coditions);
        if (check) {
          const alert = await this.alertController.create({
            header: 'Oggetto già salvato',
            message: `${item.name} è già presente nel tuo guardaroba`,
            buttons: ['Ok'],
          });

          await alert.present();
          return
        }
        let res = await this.appService.saveInCollection('wardrobes', undefined, data)

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
    if (this.cUserPreference)
      this.blockedUIDs = this.cUserPreference?.uIdBlocked

    this.filteredOutfits = []

    this.outfitUserProfile = [];

    const filteredData = this.outfits.filter(item => {
      // Verifica se blockedUIDs è definito e contiene effettivamente un array
      if (!Array.isArray(this.blockedUIDs)) {
        this.blockedUIDs = []; // Inizializza come array vuoto se è undefined
      }
      // Verifica che l'oggetto non contenga nessun UID in `uIdBlocked` o che non ci sia `uid` specificato
      return !item.userId || !this.blockedUIDs.includes(item.userId);
    });
    this.filteredOutfits = JSON.parse(JSON.stringify(filteredData));
    await this.heartIcon();
    filteredData.forEach(async rr => {
      

      this.outfitUserProfile$ = this.appService.getUserProfilebyId(rr.userId);
      this.outfitUserProfile$.subscribe((outfitUserProfile: UserProfile) => {

        this.outfitUserProfile[rr.userId] = outfitUserProfile
      })

      if (filteredData.length > 0) {

        this.isLoading = false;

      }

    });

    this.getTrendingOutfits()
  }



  async getTrendingOutfits() {

    // Ottieni la data di oggi
    const today = new Date();

    // Calcola la data di una settimana fa
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    // Ottieni il timestamp della data di una settimana fa
    const timestampOneWeekAgo = oneWeekAgo.getTime();

    const conditions: FireBaseConditions[] = [];


    conditions.push(
      {
        field: 'createdAt',
        operator: '>=',
        value: timestampOneWeekAgo
      },


    )
    conditions.push(
      {
        field: 'status',
        operator: '==',
        value: 'approved'
      }

    )
    const orderBy: FireBaseOrderBy[] = [
      { field: 'visits', by: 'desc' },
      { field: 'likes', by: 'asc' }
    ];



    const trendingOutfits = await this.appService.getFilteredCollection('outfits', conditions)
    if (trendingOutfits)
      this.trendingOutfits = trendingOutfits
  }

  async filterUserOutFit() {

    let copy = this.cUserPreference


    let queryString = `gender=${this.cUserInfo().gender}`;
    this.appService.getSuggestOutfits(queryString, copy).subscribe(respoA => {

      this.filteredOutfits = respoA
    })


  }

  createFirestoreConditions(filters: any): FireBaseConditions[] {
    const conditions: FireBaseConditions[] = [];

    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        const value = filters[key];

        // Controlla se il valore è un array vuoto e salta questa iterazione
        if (Array.isArray(value) && value.length === 0) {
          continue;  // Salta questa iterazione se l'array è vuoto
        }
        // Se il valore è un array con più di un elemento, usa "array-contains-any"
        if (Array.isArray(value) && value.length > 0) {

          // usa l'operatore "array-contains-any"
          conditions.push({
            field: key,
            operator: 'array-contains-any',
            value: filters[key]
          });

        } else if (value !== null && value !== undefined && value !== '') {
          // Se non è un array e ha un valore valido, usa "=="
          conditions.push({
            field: key,
            operator: '==',
            value: value
          });
        }
      }
    }

    return conditions;
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
        id: "bloccaContenutoutente",
        title: "Non mi interessa",
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

    let id = data.id;

    if (id == 'bloccaContenutoutente') {

      const checkSeS = this.cUserPreference?.uid === outfit.userId;

      if (checkSeS) {
        this.isOutfitCompositionOpen = false;
        return
      }


      console.log('cUserPreference-->', this.cUserPreference)
      if (!this.cUserPreference) {

        let profilePrefData = {
          uid: this.cUserID,
          color: [],
          brend: [],
          style: [],
          uIdBlocked: [outfit.userId]

        }

        let isOk = await this.userProfileService.setUserPreference(profilePrefData)
        if (isOk) {
          this.isOutfitCompositionOpen = false;
          this.loadOutfits()
          return
        }
      }
      let filterUp = this.cUserPreference!.uIdBlocked


      if (!filterUp) {
        filterUp = [];
      }

      // Aggiungi il nuovo userId bloccato
      filterUp.push(outfit.userId);

      //this.cUserPreference[0]!.uIdBlocked = filterUp;
      let profilePrefData = {
        uid: this.cUserID,
        color: this.cUserPreference?.color,
        brend: this.cUserPreference?.brend,
        style: this.cUserPreference?.style,
        uIdBlocked: filterUp

      }


      let res = await this.userProfileService.setUserPreference(profilePrefData);

      if (res) {
        this.isOutfitCompositionOpen = false;
        this.loadOutfits()
        return
      }

    }


    let dataS = {
      outFitId: outfit.id,
      userIdSegnalation: this.cUserID,
      outfitUserId: outfit.userId,
      typeSegnaletion: id,
      status: 'pedding'


    }
    const cond = [
      {
        field: 'userIdSegnalation',
        operator: '==',
        value: this.cUserID
      },
      {
        field: 'outFitId',
        operator: '==',
        value: outfit.id
      },
      {
        field: 'typeSegnaletion',
        operator: '==',
        value: id
      },
      {
        field: 'status',
        operator: '==',
        value: 'pedding'
      }
    ]
    let checkSe = await this.appService.getFilteredCollection('reports', cond);

    if (checkSe.length > 0) {
      this.isOutfitCompositionOpen = false;
      return
    }

    let res = await this.appService.saveInCollection('reports', undefined, dataS)

    if (res) {
      this.isOutfitCompositionOpen = false;
      const alert = await this.alertController.create({
        header: 'Segnalazione completata',
        message: `Ti ringraziamo per la segnalazione, prenderemo in esame la tua richiesta`,
        buttons: ['Ok'],
      });

      await alert.present();
    }

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
      const cUserID = this.cUserID
      this.userProfileService.delFaveUserOutfits(cUserID, outfitId).subscribe(faveUserOutfits => {
        this.favorites.delete(outfit.id);
        likes = likes - 1
        let data = {
          likes: likes
        }
        this.appService.updateInCollection('outfits', outfit.id, data)
      })
   
      return;
      
    }

    let data = {
      outfitId: outfit.id,
      userId: this.cUserID
    }

    this.userProfileService.saveFaveUserOutfits(data).subscribe(res=>{
      if (res) {

        this.favorites.add(outfit.id);
  
        if (this.cUserID == outfit.userId) {
          return;
        }
  
        likes = likes + 1;
  
        let data = {
          likes: likes
        }
  
        this.appService.updateInCollection('outfits', outfit.id, data)
      }
    })

    
  }

  async heartIcon() {


    this.userProfileService.loadFaveUserOutfits(this.cUserID)
      .subscribe(async faveUserOutfits => {
        
        this.favorites.clear();
        faveUserOutfits.forEach(fUserOutfits => {
          this.favorites.add(fUserOutfits.id);
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
      let visit = !outfit.visits ? 1 : outfit.visits + 1;// nVisit++
      let data = { visits: visit }
      let update = await this.appService.updateInCollection('outfits', outfit.id, data)
      if (update) {

      }
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
