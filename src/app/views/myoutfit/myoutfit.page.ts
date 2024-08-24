import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AlertController, ModalController } from '@ionic/angular';


import { AppService } from 'src/app/service/app-service';
import { buttons, outfit, Tag } from 'src/app/service/interface/outfit-all-interface';
import { ModalListComponent } from 'src/app/components/modal-list/modal-list.component';
import { UserService } from 'src/app/service/user.service';
import { Observable } from 'rxjs';
import { UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
@Component({
  selector: 'app-myoutfit',
  templateUrl: './myoutfit.page.html',
  styleUrls: ['./myoutfit.page.scss'],
})
export class MyOutFitPage implements OnInit {

  outfits: outfit[] = []
  isLoading: boolean = true;
  userID: string | undefined;
  userInfo: any;
  favorites: Set<string> = new Set();
  userProfile$!: Observable<UserProfile | null>;
  userProfile!: UserProfile;
  userPreference!:UserPreference[]
  constructor(private appService: AppService, private afAuth: AngularFireAuth, private userProfileService: UserService, private modalController: ModalController, private alertController: AlertController) {

  }

  ngOnInit() {


    this.afAuth.authState.subscribe(user => {
      if (user) {
     
        
       
        
        this.userProfile$ = this.userProfileService.getUserProfile();

        this.userProfile$.subscribe(async userProfile => {
          if (userProfile)
            this.userProfile = userProfile;
            this.userInfo = userProfile;
            this.userID = this.userProfile.uid;

            this.userPreference = await this.userProfileService.getUserPreference();
            this.loadOutfits();  // Carica gli outfit solo se l'utente è loggato
        })

        
      }
    });
    // this.loadOutfits();



  }

  async openFilterModal(): Promise<{}> {

    const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'filtersForm',

      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('Modal data:', data);

    return data

  }

  async showOutfitComposition(tags: Tag) {



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

    let nameEv = data.name;
    let item = data.item;
    let category = !item.outfitCategory ? '' : item.outfitCategory
    let subCategory = !item.outfitSubCategory ? '' : item.outfitSubCategory
    switch (nameEv) {
      case
        "saveInCloset":
        let data = {
          id: item.id,
          userId: this.userID,
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



    this.isLoading = true;
    this.appService.getOutfits('user_0001').subscribe((newOutfits: outfit[]) => {
      
      this.outfits = newOutfits.filter(outfit => this.matchesPreferences(outfit));
      this.outfits.forEach(rr => {
        this.heartIcon(rr.id)
      })
      if (this.outfits.length > 0) {
        this.isLoading = false;
      }

    });
  }

  matchesPreferences(outfit: any): boolean {
    // Logica per confrontare l'outfit con le preferenze dell'utente
    // Se userPreferences non è definito o è un array vuoto, restituisci true per mostrare tutti gli outfit
  if (!this.userPreference || this.userPreference.length === 0) {
    return true;
  }

  // Scorri l'array userPreferences e controlla se l'outfit corrisponde a una delle preferenze
  return this.userPreference.some(preference => {

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
        field: 'userId', operator: '==', value: this.userID
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
      userId: this.userID
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
        field: 'userId', operator: '==', value: this.userID
      }
    ]

    let data = await this.appService.getFilteredCollection('faveUserOutfits', coditions)
    if (data)
      this.favorites.clear();
    data.forEach(doc => {

      this.favorites.add(doc.outfitId);
    });
    console.log(this.favorites)


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
