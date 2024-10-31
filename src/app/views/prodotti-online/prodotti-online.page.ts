import { Component, inject, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { ModalController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/service/app-service';
import { FireBaseConditions, FireBaseOrderBy, outfitCategories, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { UserProfile } from 'src/app/service/interface/user-interface';
import { ProdottiOnlineService } from 'src/app/service/prodotti-online.service';

@Component({
  selector: 'app-prodotti-online',
  templateUrl: './prodotti-online.page.html',
  styleUrls: ['./prodotti-online.page.scss'],
})
export class ProdottiOnlinePage implements OnInit {
  constructor(private modalController: ModalController, private navController: NavController,private afAuth: AngularFireAuth,) { }

  private appService = inject(AppService);


  // Store selezionato

  public products: any[] = []; // Array di prodotti
  public filteredproducts: any[] = []; // Array di prodotti
  public categories?: outfitCategories[]
  public currentPage: number = 1;
  gender=""
  outfitCategory = "";
  outfitSubCategory = "";
  selectedCategoryName = "Tutti i prodotti";
  selectedFilterStyleIndex?:number;
  isModal:boolean = true
  ngOnInit() {
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        console.log('user',user)
        //this.userID = user.uid;
        const userData$ = this.appService.getUserProfilebyId( user.uid);
        userData$.subscribe((outfitUserProfile: UserProfile) => {

          if (outfitUserProfile) {
            this.gender = outfitUserProfile.gender;
            this.loadCategories(this.outfitCategory)
            this.loadProducts(this.outfitCategory, this.outfitSubCategory);
          } 
        })
         
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
    let conditions = []
    if (outfitCategory) {
      conditions.push(
        {
          field: 'outfitCategory',
          operator: '==',
          value: outfitCategory
        }
      )
    }
    if (outfitSubCategory) {
      conditions.push(
        {
          field: 'outfitSubCategory',
          operator: '==',
          value: outfitSubCategory
        }
      )
    }

    conditions.push({
      field: 'gender',
      operator: '==',
      value: this.gender
    })


    let products = await this.appService.getFilteredCollection('outfitsProducts', conditions);
    this.products = products



  }


  //Metodo caricaCategorie

  async loadCategories(parent?: any) {

    let condictionCat: FireBaseConditions[] = [];
    if (!parent) {
      parent = ""
    }
    condictionCat.push({
      field: 'parentCategory',
      operator: '==',
      value: parent
    })
    condictionCat.push({
      field: 'gender',
      operator: 'array-contains',
      value: this.gender
    })


    this.categories = await this.appService.getFilteredCollection('outfitsCategories', condictionCat);
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
  async saveToWardrobe(product: any) {
    const modal = await this.modalController.getTop();
    if (modal) {
      this.modalController.dismiss(product);
      return
    }
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
