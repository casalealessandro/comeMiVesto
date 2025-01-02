import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { IonModal, ModalController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/service/app-service';
import { FireBaseConditions, outfit, Tag, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { SharedDataService } from 'src/app/service/shared-data.service';

@Component({
  selector: 'app-detail-outfit',
  templateUrl: './detail-outfit.page.html',
  styleUrls: ['./detail-outfit.page.scss'],
})
export class DetailOutfitPage implements OnInit {

  @Input() tags!: Tag[]
  @Input() image!: string;
  @Output() selectedItem:EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;
  outfitId: any
  isOpen: boolean = false;
  outfitComposed: any
  userID: string = '';
  relatedProducts:any[] = []
  constructor(
    private modalController: ModalController, 
    private router:Router, 
    private route: ActivatedRoute, 
    private appService: AppService, 
    private navController: NavController,private afAuth: AngularFireAuth,
    private sharedData:SharedDataService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.outfitId = params.get('id');
      if (this.outfitId) {


        let outfits: outfit[] = await this.appService.getFilteredCollection('outfits', [{
          field: 'id',
          operator: '==',
          value: this.outfitId
        }]);
        this.image = outfits[0].imageUrl
        this.tags = outfits[0].tags;

        if (this.tags.length > 0) {
          this.isOpen = true;
          console.log(this.tags)
        }
        
        let conditions:FireBaseConditions[] = []
        
        conditions.push({
              field: 'outfitSubCategory',
              operator: "array-contains-any",
              value: outfits[0].outfitSubCategory
            })
        conditions.push({
          field: 'gender',
          operator: '==',
          value: outfits[0].gender
        })
        let products: any[] = await this.appService.getMultiFiltered('outfitsProducts',conditions); 
       
        if (this.tags.length > 0 && this.isOpen) {
          const tags =this.tags
          this.relatedProducts = products.filter(prod => 
            !this.tags.some(tag => String(tag.id) === String(prod.id)) // Confronta gli ID come stringhe
        );
          
        }
      }
    });

    this.afAuth.authState.subscribe(async user => {
      if (user) {
        this.userID = user.uid;
      }
    })  

    this.sharedData.setData({
      componentName:'HeaderComponent',
      data: {
        
        showLogo:false,
        showUserInfo:false,
        titleText:'Dettaglio outfit',
        showTitleText:true,
        canGoBack:true
      }
    })
  }




  closeModalFullScreen() {
    this.modalController.dismiss()
    this.navController.back();

  }
  onBreakpointChange(event: CustomEvent) {
    const breakpoint = event.detail.breakpoint;
    if (breakpoint === 1) {
      // Blocca il modal impostando il breakpoint finale
      const modal = event.target as unknown as IonModal;
      modal.breakpoints = [1];
      modal.backdropBreakpoint = 1;
    }
  }
  async openItmClothing(tag: Tag) {


  }

  async buyToStore(prod: Tag) {
    let link = !prod.link ? '#' : prod.link

    if (link != '#') {
      await Browser.open({ url: link });
    }
  }
  async saveItem(dataProduct: any) {
    const data = dataProduct.data
    const categoryID = data.outfitCategory;
    const subCategoryID = data.outfitSubCategory;
    const link = !data.link ? '#' : data.link
   
    const id = data.id;


    let coditions = [

      {
        field: 'userId', operator: '==', value: this.userID
      },
      {
        field: 'id', operator: '==', value: id
      }
    ]

    let check = await this.appService.getFilteredCollection('wardrobes', coditions);
    if (check.length > 0) {
    
      return
    }

    let saveData:wardrobesItem = {
      
      brend: data.brend,
      id: id,
      images: data.imageUrl || data.images,
      name: data.name,
      outfitCategory: categoryID,
      outfitSubCategory: subCategoryID,
      color:data.color,
      userId: this.userID,
      prezzo:parseInt(data.price, 10),
      link:link
    }

    let resSave = await this.appService.saveInCollection('wardrobes',undefined,saveData)
    if(resSave)
      alert('Elemento aggiunto alla tua wardrobe con successo!')
  }

  async selectItem(itm:any){
    const subCategoryID = itm.outfitSubCategory;
    const color = itm.color;

    // Controlla se la pagina è aperta in un modale
    const modal = await this.modalController.getTop();
    if (modal) {
     this.modalController.dismiss(itm)
    }else{
      this.selectedItem.emit(itm)
    }

    this.appService.selectedProduct.set(itm);
   
    
    // Naviga alla lista dei prodotti
    // Usa il router per navigare alla pagina della lista
    this.router.navigate(['/tabs/myoutfit']);
  }

  generateGUID(): any {
    function s4(): any {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }
}
