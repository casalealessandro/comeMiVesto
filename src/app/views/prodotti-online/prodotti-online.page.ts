import { Component, DestroyRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from 'src/app/service/firebase.service';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { InfiniteScrollCustomEvent, IonInfiniteScroll, ModalController, NavController } from '@ionic/angular';
import { AppCatalogProduct, AppService, CatalogProductsResponse } from 'src/app/service/app-service';
import { CategoryService } from 'src/app/service/category.service';
import { outfitCategories } from 'src/app/service/interface/outfit-all-interface';
import { UserProfile } from 'src/app/service/interface/user-interface';
import { ProdottiOnlineService } from 'src/app/service/prodotti-online.service';
import { UserService } from 'src/app/service/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-prodotti-online',
  templateUrl: './prodotti-online.page.html',
  styleUrls: ['./prodotti-online.page.scss'],
})
export class ProdottiOnlinePage implements OnInit {
  @Input() showHeader:boolean = false;
  @ViewChild(IonInfiniteScroll) infiniteScroll?: IonInfiniteScroll;
  constructor(
    private modalController: ModalController,
    private categoryService:CategoryService,
    private navController: NavController,
    private firebase: FirebaseService,
    private userProfileService: UserService,

  ) { }

  private appService = inject(AppService);
  private destroyRef = inject(DestroyRef);


  // Store selezionato
  userProfile$ = this.userProfileService.gUserProfile();
  
  public products: AppCatalogProduct[] = []; // Array di prodotti
  public filteredproducts: any[] = []; // Array di prodotti
  public categories?: outfitCategories[]
  nextCursor: string | null = null;
  hasMore = true;
  isLoading = false;
  userID: any;
  gender=""
  outfitCategory = "";
  outfitSubCategory = "";
  selectedCategoryName = "Tutti i prodotti";
  selectedFilterStyleIndex?:number;
  isModal:boolean = true
  ngOnInit() {
    this.firebase.authState.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async user => {
      if (user) {
       
        this.userID =  this.userProfile$()?.uid; 
        this.gender = this.userProfile$()?.gender || '';
        //this.gender = outfitUserProfile.gender;
        this.categoryService.categoriesSubject.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((categories: outfitCategories[]) => {

          this.categories =categories
        })
        this.resetProducts();
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

  async loadProducts(outfitCategory?: string, outfitSubCategory?: string, append = false) {
    if (this.isLoading || (append && !this.hasMore)) return;

    this.isLoading = true;
    try {
      const cursor = append && this.nextCursor ? this.nextCursor : undefined;
      const response: CatalogProductsResponse = outfitCategory || outfitSubCategory
        ? await this.appService.filterOutfitProducts({
            ...(outfitCategory ? { outfitCategory: [String(outfitCategory)] } : {}),
            ...(outfitSubCategory ? { outfitSubCategory: [String(outfitSubCategory)] } : {}),
            ...(this.gender ? { gender: this.gender } : {}),
            limit: 20,
            ...(cursor ? { cursor } : {})
          })
        : await this.appService.getOutfitProducts({
            ...(this.gender ? { gender: this.gender } : {}),
            limit: 20,
            ...(cursor ? { cursor } : {})
          });

      const products = append ? [...this.products, ...response.data] : response.data;
      this.products = products.filter((product, index, allProducts) =>
        allProducts.findIndex(candidate => String(candidate.id) === String(product.id)) === index
      );
      this.nextCursor = response.pagination.nextCursor;
      this.hasMore = response.pagination.hasMore;
    } finally {
      this.isLoading = false;
    }
  }

  private resetProducts() {
    this.products = [];
    this.nextCursor = null;
    this.hasMore = true;
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;
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
      this.outfitCategory = '';
      this.outfitSubCategory = '';
      await this.loadCategories();
      this.resetProducts();
      await this.loadProducts(this.outfitCategory, this.outfitSubCategory);
      return
    }
    this.selectedCategoryName = category.categoryName;

    if (!category.parentCategory) {
      //this.selectedFilterStyleIndex = indexCategory;
      this.outfitCategory = String(category.id);
      this.outfitSubCategory = '';
      this.resetProducts();
      await this.loadProducts(this.outfitCategory, this.outfitSubCategory);
      await this.loadCategories(category.id)
      return
    }

    if (category.parentCategory) {
      this.selectedFilterStyleIndex = indexCategory;
      this.outfitCategory = String(category.parentCategory);
      this.outfitSubCategory = String(category.id);
      this.resetProducts();
      await this.loadProducts(this.outfitCategory, this.outfitSubCategory);
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
  async loadMoreProducts(event: InfiniteScrollCustomEvent) {
    try {
      if (!this.isLoading && this.hasMore) {
        await this.loadProducts(this.outfitCategory, this.outfitSubCategory, true);
      }
    } finally {
      await event.target.complete();
      if (!this.hasMore) event.target.disabled = true;
    }
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
          prezzo:data.prezzo ?? data.price,
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
