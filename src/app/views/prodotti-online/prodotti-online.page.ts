import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { ModalController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/service/app-service';
import { CategoryService } from 'src/app/service/category.service';
import { outfitCategories } from 'src/app/service/interface/outfit-all-interface';
import { UserProfile } from 'src/app/service/interface/user-interface';
import { ProdottiOnlineService } from 'src/app/service/prodotti-online.service';
import { UserService } from 'src/app/service/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-prodotti-online',
  templateUrl: './prodotti-online.page.html',
  styleUrls: ['./prodotti-online.page.scss'],
})
export class ProdottiOnlinePage implements OnInit {
  @Input() showHeader:boolean = false;
  constructor(
    private modalController: ModalController,
    private categoryService:CategoryService,
    private navController: NavController,
    private afAuth: AngularFireAuth,
    private userProfileService: UserService,

  ) { }

  private appService = inject(AppService);
  private destroyRef = inject(DestroyRef);


  // Store selezionato
  userProfile$ = this.userProfileService.gUserProfile();
  
  public products: any[] = []; // Array di prodotti
  public filteredproducts: any[] = []; // Array di prodotti
  public categories?: outfitCategories[]
  public currentPage: number = 1;
  userID: any;
  gender=""
  outfitCategory = "";
  outfitSubCategory = "";
  selectedCategoryName = "Tutti i prodotti";
  selectedFilterStyleIndex?:number;
  isModal:boolean = true
  ngOnInit() {
    this.afAuth.authState.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async user => {
      if (user) {
       
        this.userID =  this.userProfile$()?.uid; 
        this.gender = this.userProfile$()?.gender || '';
        //this.gender = outfitUserProfile.gender;
        this.categoryService.categoriesSubject.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((categories: outfitCategories[]) => {

          this.categories =categories
        })
        this.loadProducts(this.outfitCategory, this.outfitSubCategory);
         
      }else{
        this.handleBackButton()
      }
    })    
    setTimeout(async () => {
      const modal = await this.modalController.getTop();
        if(!modal){
          this.isModal = false
        }  
    }, 500);
    
  }

  async loadProducts(outfitCategory?: any, outfitSubCategory?: any) {
    const filters = {
      ...(outfitCategory ? { outfitCategory: [String(outfitCategory)] } : {}),
      ...(outfitSubCategory ? { outfitSubCategory: [String(outfitSubCategory)] } : {})
    };
    const products = outfitCategory || outfitSubCategory
      ? await this.appService.filterOutfitProducts(filters)
      : await this.appService.getData('outfit-products', '');
    this.products = products.filter((product: any) => !this.gender || product.gender === this.gender)



  }


  //Metodo caricaCategorie

  async loadCategories(parent?: any) {

    
    if (!parent) {
      parent = "";
      this.categoryService.categoriesSubject.pipe(take(1)).subscribe((categories: outfitCategories[]) => {

        this.categories =categories
       })
       return 
    }
    

    this.categories = await this.categoryService.categoriesByParent(parent, this.gender) 
    console.log('categories', this.categories)
  }

  async filterCategory(indexCategory?:number,category?: outfitCategories) {
    
    
      
      this.selectedFilterStyleIndex = undefined;
    
    
    
    

    if (!category) {
      this.selectedCategoryName = 'Tutti i prodotti'
      await this.loadCategories();
      await this.loadProducts();
      return
    }
    this.selectedCategoryName = category.categoryName;

    if (!category.parentCategory) {
      //this.selectedFilterStyleIndex = indexCategory;
      await this.loadProducts(category.id);
      await this.loadCategories(category.id)
      return
    }

    if (category.parentCategory) {
      this.selectedFilterStyleIndex = indexCategory;
      
      this.loadProducts(category.parentCategory, category.id);
    }
  }
  // Funzione link allo store
  async buyToStore(itm: any) {
    let link = !itm.link ? '#' : itm.link

    if (link != '#') {
      await Browser.open({ url: link });
    }
  }

  // Carica più prodotti (paginazione)
  loadMoreProducts() {
    this.currentPage++;
    this.loadProducts();
  }


  // Salva il prodotto nel guardaroba
  async saveToWardrobe(dataProduct: any) {
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
    
        const resSave = await this.appService.createWardrobe(saveData)
        if(resSave)
          alert('Elemento aggiunto alla tua wardrobe con successo!')
  }

  async handleBackButton() {

    // Altrimenti, esegui il comportamento predefinito del back button
    const modal = await this.modalController.getTop();
    if (modal) {
      // Se c'è un modale aperto, chiudi il modale
      modal.dismiss();
    } else {
      // Altrimenti, esegui il comportamento predefinito del back button
      this.navController.back();
    }

  }

  genderReveral(gen: string): string {
    switch (gen) {
      case 'D':
        return ' Donna '


      case 'U':
        return ' Uomo '

      default:
        return ''
    }
  }
}
