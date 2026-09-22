import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FirebaseService } from 'src/app/service/firebase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { IonModal, ModalController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/service/app-service';
import { seasons, style, Tag } from 'src/app/service/interface/outfit-all-interface';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { register } from 'swiper/element/bundle';

register();

@Component({
  standalone: false,
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
  outfitStyle: string = '';
  outfitSeason: string = '';
  userID: string = '';
  relatedProducts:any[] = []
  isLoading: boolean = true;
  isImagePreviewOpen: boolean = false;
  constructor(
    private modalController: ModalController, 
    private router:Router, 
    private route: ActivatedRoute, 
    private appService: AppService, 
    private navController: NavController,private firebase: FirebaseService,
    private sharedData:SharedDataService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.outfitId = params.get('id');
      if (!this.outfitId) {
        this.isLoading = false;
        return;
      }

      this.isLoading = true;
      try {
        const selectedOutfit = await this.appService.getOutfit(this.outfitId);
        this.outfitComposed = selectedOutfit;
        this.image = selectedOutfit.imageUrl
        this.tags = Array.isArray(selectedOutfit.tags) ? selectedOutfit.tags : [];
        this.outfitStyle = style.find(item => item.id === selectedOutfit.style)?.value || '';
        this.outfitSeason = seasons.find(item => item.id === selectedOutfit.season)?.value || '';
        this.isOpen = false;
        this.relatedProducts = [];

        if (this.tags.length > 0) {
          this.isOpen = true;
          console.log(this.tags)

          const response = await this.appService.filterOutfitProducts({
            outfitSubCategory: selectedOutfit.outfitSubCategory,
            gender: selectedOutfit.gender,
            limit: 20
          });
          const products = response.data;

          this.relatedProducts = products.filter(prod =>
            !this.tags.some(tag => String(tag.id) === String(prod.id)) // Confronta gli ID come stringhe
          );
        }
      } catch (error) {
        console.error('Impossibile caricare il dettaglio outfit:', error);
      } finally {
        this.isLoading = false;
      }
    });

    this.firebase.authState.subscribe(async user => {
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




  openImagePreview(): void {
    if (!this.image) return;
    this.isImagePreviewOpen = true;
  }

  closeImagePreview(): void {
    this.isImagePreviewOpen = false;
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
      catalogProductId: data.id,
      brend: data.brend,
      images: Array.isArray(data.images) ? data.images : data.imageUrl ? [data.imageUrl] : [],
      imageUrl: data.imageUrl,
      name: data.name,
      outfitCategory: categoryID,
      outfitSubCategory: subCategoryID,
      color:data.color,
      prezzo:data.prezzo ?? data.price,
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
