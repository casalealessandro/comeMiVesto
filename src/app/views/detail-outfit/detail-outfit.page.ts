import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { IonModal, ModalController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/service/app-service';
import { Tag, toProductGender } from 'src/app/service/interface/outfit-all-interface';
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


        const selectedOutfit = await this.appService.getOutfit(this.outfitId);
        this.image = selectedOutfit.imageUrl
        this.tags = selectedOutfit.tags;

        if (this.tags.length > 0) {
          this.isOpen = true;
          console.log(this.tags)
        }
        
        let products: any[] = await this.appService.filterOutfitProducts({
          outfitSubCategory: selectedOutfit.outfitSubCategory,
        });
        const productGender = toProductGender(selectedOutfit.gender);
        products = products.filter(product => !productGender || toProductGender(product.gender) === productGender);
       
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
   
    const saveData = {
      brend: data.brend,
      images: Array.isArray(data.images) ? data.images : data.imageUrl ? [data.imageUrl] : [],
      imageUrl: data.imageUrl,
      name: data.name,
      outfitCategory: categoryID,
      outfitSubCategory: subCategoryID,
      color:data.color,
      prezzo:parseInt(data.price, 10),
      link:link
    }

    const saved = await this.appService.createWardrobe(saveData)
    if(saved)
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
