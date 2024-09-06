import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AlertController, ModalController, RefresherEventDetail } from '@ionic/angular';


import { AppService } from 'src/app/service/app-service';
import { buttons, FireBaseConditions, outfit, Tag } from 'src/app/service/interface/outfit-all-interface';
import { ModalListComponent } from 'src/app/components/modal-list/modal-list.component';
import { UserService } from 'src/app/service/user.service';
import { Observable } from 'rxjs';
import { UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
import { FilterOutfitsPage } from '../filter-outfits/filter-outfits.page';
import { IonRefresherCustomEvent } from '@ionic/core';
@Component({
  selector: 'app-myoutfit',
  templateUrl: './myoutfit.page.html',
  styleUrls: ['./myoutfit.page.scss'],
})
export class MyOutFitPage implements OnInit {


  outfits: outfit[] = []
  filteredOutfits: outfit[] = []; // Array per gli outfit filtrati
  isLoading: boolean = true;
  cUserID: string | undefined;
  cUserInfo: any;
  favorites: Set<string> = new Set();
  currentUserProfile$!: Observable<UserProfile | null>;
  outfitUserProfile$!: Observable<UserProfile>;
  outfitUserProfile!: UserProfile[];
  cUserPreference!:UserPreference[]
  isOutfitCompositionOpen: boolean = false;
  currentFilterSel:any;
  filterColor:any[] = [];
  isFiltersSel:boolean=false
  backgroundImage: any="url(assets/fallback-image.jpg);"  ;
  constructor(private appService: AppService, private afAuth: AngularFireAuth, private userProfileService: UserService, private modalController: ModalController, private alertController: AlertController) {

  }

  ngOnInit() {


    this.afAuth.authState.subscribe(user => {
      if (user) {
     
       
       
        
        this.currentUserProfile$ = this.userProfileService.getUserProfile();

        this.currentUserProfile$.subscribe(async userProfile => {
          if (userProfile)
           
            this.cUserInfo = userProfile;
            this.cUserID = this.cUserInfo.uid;

            this.cUserPreference = await this.userProfileService.getUserPreference();
            this.loadOutfits();  // Carica gli outfit solo se l'utente è loggato
        })

        
      }
    });
    // this.loadOutfits();



  }

  async openFilterModal() {
    this.isFiltersSel = false
    const modal = await this.modalController.create({
      component: FilterOutfitsPage,
      componentProps: {
        currentFilterSel:this.currentFilterSel

      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log( data);
    this.filterColor = data.color;
    this.currentFilterSel = {...data};
    

    //Non cerco nel colore del capo di abbiglimento trami firebase, quindi estraggo il colori se sono presenti nella scelta e li filtro poi a mano.
    delete data.color
    delete data.outfitCategory
    
      
    const cond = this.createFirestoreConditions(data)
    
    let respoA = await this.appService.getFilteredOutfits(cond);

    const outfitColor = respoA.filter(outfit => this.matchColorPreference(outfit)); 
    console.log('outfitColor',outfitColor)
    if(outfitColor.length >0){
      this.filteredOutfits = outfitColor;
      this.isFiltersSel = true
      return
    }
    this.filteredOutfits = respoA;
    
  }

  
  
  matchColorPreference(outfit:outfit){
    return this.filterColor.some(color => {

      const colors = color 
      
  
      const matchesColor = outfit.tags.some((tag: any) => colors.includes(tag.color));
      
      // Restituisce true se almeno una delle preferenze corrisponde all'outfit
      return matchesColor 
    });
  }

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

    let conditions:FireBaseConditions[] = []
    const preferencC = this.createQueryConditions()
    this.filteredOutfits =[]
    this.isLoading = true;
    let newOutfits = await this.appService.getFilteredCollection('outfits',conditions) 
      //console.log(JSON.stringify(newOutfits))
      //.filter(outfit => this.matchesPreferences(outfit));
      
      this.outfitUserProfile = [];
      const copyOutfit = await this.appService.getFilteredOutfits(preferencC) ;
      console.log('matchesPreferences-->',copyOutfit)
      this.outfits = newOutfits
      this.filteredOutfits = [...this.outfits];
     
      this.outfits.forEach(async rr => {
        this.heartIcon(rr.id);
        this.outfitUserProfile$ = this.appService.getUserProfilebyId(rr.userId);
        this.outfitUserProfile$.subscribe(outfitUserProfile=>{
          this.outfitUserProfile[rr.userId] = outfitUserProfile
        })
        
      if (this.outfits.length > 0) {
        this.isLoading = false;
      }
      console.log('filteredOutfits-->',this.filteredOutfits)
    });
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
              value:  filters[key]
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
  
  createQueryConditions():FireBaseConditions[]{
    
    let conditions: FireBaseConditions[] = []
    this.cUserPreference.forEach(pref=>{
     
        // Itero sulle proprietà di ogni oggetto
        (Object.keys(pref) as (keyof UserPreference)[]).forEach(key => {
          const value = pref[key];
          let operator = '=='
          //operator = key == 'color' ? operator = 'array-contains-any'  : '==';
           

          // Controllo se il valore è un array non vuoto
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((val: string) => {
              // Aggiungo una nuova condizione per ogni elemento dell'array
              conditions.push({
                field: key,       // Il nome della proprietà come campo
                operator: operator,   // L'operatore può essere dinamico se necessario
                value: val        // L'elemento dell'array come valore
              });
            });
          }
        });
     
    
    })

    return conditions
    
  }

  
  
  matchesPreferences(outfit: any): boolean {
    // Logica per confrontare l'outfit con le preferenze dell'utente
    // Se userPreferences non è definito o è un array vuoto, restituisci true per mostrare tutti gli outfit
  if (!this.cUserPreference || this.cUserPreference.length === 0) {
    return true;
  }

  // Scorri l'array userPreferences e controlla se l'outfit corrisponde a una delle preferenze
  return this.cUserPreference.some(preference => {

    const colors = preference.color || [];
    const brend = preference.brend || [];

    const matchesColor = !preference.color || preference.color.length === 0 || outfit.tags.some((tag: any) => colors.includes(tag.color));
    const matchesStyle = !preference.style || preference.style.length === 0 || preference.style.includes(outfit.style);
    const matchesbrend = !preference.brend || preference.brend.length === 0 || outfit.tags.some((tag: any) => brend.includes(tag.brend));

    // Restituisce true se almeno una delle preferenze corrisponde all'outfit
    return matchesColor || matchesStyle || matchesbrend;
  });
  }

  async addFavoriteOutfit(outfitId: any) {
    let coditions = [
      {
        field: 'outfitId', operator: '==', value: outfitId
      },
      {
        field: 'userId', operator: '==', value: this.cUserID
      }
    ]
    if (this.favorites.has(outfitId)) {
      let res = await this.appService.deleteDocuments('faveUserOutfits', coditions)
      if (res) {
        this.favorites.delete(outfitId);
        return
      }
    }

    let data = {
      outfitId: outfitId,
      userId: this.cUserID
    }

    let res = await this.appService.saveInCollection('faveUserOutfits', undefined, data)

    if (res) {
      this.favorites.add(outfitId);
    }
  }

  async heartIcon(id: any) {
    let coditions = [
      {
        field: 'outfitId', operator: '==', value: id
      },
      {
        field: 'userId', operator: '==', value: this.cUserID
      }
    ]

    let data = await this.appService.getFilteredCollection('faveUserOutfits', coditions)
    if (data)
      this.favorites.clear();
    data.forEach(doc => {

      this.favorites.add(doc.outfitId);
    });
//    console.log(this.favorites)


  }

  isFavorite(outfitId: string): boolean {
    // Verifica se l'outfitId è presente nel set dei preferiti
    return this.favorites.has(outfitId);
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

}