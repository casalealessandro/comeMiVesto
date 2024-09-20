import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AlertController, ModalController, RefresherEventDetail } from '@ionic/angular';


import { AppService } from 'src/app/service/app-service';
import { buttons, FireBaseConditions, FireBaseOrderBy, outfit, Tag } from 'src/app/service/interface/outfit-all-interface';
import { ModalListComponent } from 'src/app/components/modal-list/modal-list.component';
import { UserService } from 'src/app/service/user.service';
import { Observable } from 'rxjs';
import { UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
import { FilterOutfitsPage } from '../filter-outfits/filter-outfits.page';
import { IonRefresherCustomEvent } from '@ionic/core';
import { DetailOutfitPage } from '../detail-outfit/detail-outfit.page';
@Component({
  selector: 'app-myoutfit',
  templateUrl: './myoutfit.page.html',
  styleUrls: ['./myoutfit.page.scss'],
})
export class MyOutFitPage implements OnInit {


  outfits = this.appService.resultsSignal();
  trendingOutfits: outfit[] = []
  filteredOutfits: outfit[] = []; // Array per gli outfit filtrati
  isLoading: boolean = true;
  cUserID: string = '';
  cUserInfo: any;
  favorites: Set<string> = new Set();
  currentUserProfile$!: Observable<UserProfile | null>;
  outfitUserProfile$!: Observable<UserProfile>;
  outfitUserProfile!: UserProfile[];
  cUserPreference!:Partial<UserPreference[]>
  isOutfitCompositionOpen: boolean = false;
  currentFilterSel:any;
  filterColor:any[] = [];
  isFiltersSel:boolean=false
  backgroundImage: any="url(assets/fallback-image.jpg);"  ;
  blockedUIDs:any=[]
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
           this.blockedUIDs = this.cUserPreference[0]?.uIdBlocked
            this.loadOutfits();  // Carica gli outfit solo se l'utente è loggato

            
        })
        

      }
    });
    // this.loadOutfits();



  }

  ionViewWillEnter (){
    this.loadOutfits();
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

    let conditions:FireBaseConditions[] = [
      {
        field: 'status',
        operator: '==',
        value: 'approved'
      }
    ]
    //const preferencC = this.createQueryConditions()
    this.filteredOutfits =[]
    this.isLoading = true;
    let newOutfits = await this.appService.getFilteredCollection('outfits',conditions) 
    
      this.outfits = newOutfits; // Il segnale verrà aggiornato qui
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
     
      filteredData.forEach(async rr => {
        this.heartIcon(rr.id);

        this.outfitUserProfile$ = this.appService.getUserProfilebyId(rr.userId);
        this.outfitUserProfile$.subscribe((outfitUserProfile:UserProfile)=>{
         
          this.outfitUserProfile[rr.userId] = outfitUserProfile
        })
        
        if (filteredData.length > 0) {
          this.isLoading = false;
        }
//      console.log('filteredOutfits-->',this.filteredOutfits)
      });

      this.getTrendingOutfits()
  }

 
  async getTrendingOutfits() {
    //const oneWeekAgo = new Date();
    //oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    //oneWeekAgo.setDate(oneWeekAgo.getDate());
    
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
        value:  timestampOneWeekAgo
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

  
    
  this.trendingOutfits = await this.appService.getFilteredCollection('outfits',conditions)
  
   // console.log('trendingOutfits-->',this.trendingOutfits)
    
   
    /* return this.firestore.collection('outfits', ref => 
      ref.where('createdAt', '>=', )
         .orderBy('visits', 'desc')
         .orderBy('likes', 'desc')
         .limit(10)
    ).valueChanges(); */
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
  
 
  async outfitMenu(outfit:outfit){
    
    this.modalController.dismiss()
    

  // Imposta la variabile a true quando il modale viene aperto
  this.isOutfitCompositionOpen = true;  
    let itemsElement = [
      {
        id:"segnalaUtente",
        title:"Segnala l'utente",
        icon:'alert'
      },
      {
        id:"segnalaContenuto",
        title:"Segnala outfit",
        icon:'flag'
      },
      {
        id:"bloccaContenutoutente",
        title:"Non mi interessa",
        icon:'eye-off-outline'
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
    
    if(id == 'bloccaContenutoutente'){
     
      const checkSeS = this.cUserPreference.filter(ress=>ress?.uid == outfit.userId)
  
      if(checkSeS.length>0){
        this.isOutfitCompositionOpen = false;  
        return
      }


      console.log('cUserPreference-->',this.cUserPreference)
      if(this.cUserPreference.length == 0){
        
        let profilePrefData ={
          uid:this.cUserID,
          color: [],
          brend: [],
          style: [],
          uIdBlocked:[outfit.userId]
          
        }
        
        let isOk = await this.userProfileService.setUserPreference(profilePrefData)
        if(isOk){
          this.isOutfitCompositionOpen = false;  
          this.loadOutfits()
          return
        }
      }
      let filterUp = this.cUserPreference[0]!.uIdBlocked
        
     
      if (!filterUp) {
        filterUp = [];
      }

      // Aggiungi il nuovo userId bloccato
      filterUp.push(outfit.userId);

      //this.cUserPreference[0]!.uIdBlocked = filterUp;
      let profilePrefData ={
        uid:this.cUserID,
        color: this.cUserPreference[0]?.color,
        brend: this.cUserPreference[0]?.brend,
        style: this.cUserPreference[0]?.style,
        uIdBlocked:filterUp
        
      }
          
          
      let res = await this.userProfileService.setUserPreference(profilePrefData);

      if(res){
        this.isOutfitCompositionOpen = false;  
        this.loadOutfits()
        return
      }
      
    }


    let dataS = {
      outFitId: outfit.id,
      userIdSegnalation: this.cUserID,
      outfitUserId:outfit.userId,
      typeSegnaletion: id,
      status:'pedding'
      

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
    let checkSe = await this.appService.getFilteredCollection('reports',cond);

    if(checkSe.length>0){
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
    


    let coditions = [
      {
        field: 'outfitId', operator: '==', value: outfit.id
      },
      {
        field: 'userId', operator: '==', value: this.cUserID
      }
    ]
    let likes = outfit.likes
    if (this.favorites.has(outfit.id)) {
      
      let res = await this.appService.deleteDocuments('faveUserOutfits', coditions)
      
      if (res) {
        
        likes = likes -1
        let data  ={
          likes: likes
        }
        this.appService.updateInCollection('outfits',outfit.id,data)
        this.favorites.delete(outfit.id);
        return;
      }

    }

    let data = {
      outfitId: outfit.id,
      userId: this.cUserID
    }

    let res = await this.appService.saveInCollection('faveUserOutfits', undefined, data)

    if (res) {

      this.favorites.add(outfit.id);
      
      if(this.cUserID == outfit.userId){
        return;
      }

      likes = likes + 1;

      let data  ={
        likes: likes
      }

      this.appService.updateInCollection('outfits',outfit.id,data)
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

  async hasOutfitVisitFull(outfit:outfit){
    
    const modal = await this.modalController.create({
      component: DetailOutfitPage,
      componentProps: {
        image: outfit.imageUrl, // Array degli elementi da visualizzare
        tags: outfit.tags, // Titolo della lista
        
      },
      initialBreakpoint: 1,
      breakpoints: [1],
      backdropDismiss: false,
      backdropBreakpoint: 0.77
    });

    await modal.present();
    
    if(outfit.userId == this.cUserID){
      return
    }
      let visit = !outfit.visits ? 1 : outfit.visits + 1;// nVisit++
      let data = { visits: visit }
      let update = await this.appService.updateInCollection('outfits',outfit.id,data)
      if(update){
       
      }

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
