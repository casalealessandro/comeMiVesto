import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/service/app-service';
import { FireBaseConditions, FireBaseOrderBy, outfitCategories, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { ProdottiOnlineService } from 'src/app/service/prodotti-online.service';

@Component({
  selector: 'app-prodotti-online',
  templateUrl: './prodotti-online.page.html',
  styleUrls: ['./prodotti-online.page.scss'],
})
export class ProdottiOnlinePage implements OnInit {
  constructor(private modalController: ModalController, private navController: NavController, private router: Router) { }

  private appService = inject(AppService);


  // Store selezionato

  public products: any[] = []; // Array di prodotti
  public filteredproducts: any[] = []; // Array di prodotti
  public categories?: outfitCategories[]
  public currentPage: number = 1;
  outfitCategory = "";
  outfitSubCategory = "";

  ngOnInit() {
    this.loadCategories()
    this.loadProducts(this.outfitCategory, this.outfitSubCategory);
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


    this.categories = await this.appService.getFilteredCollection('outfitsCategories', condictionCat);
    console.log('categories', this.categories)
  }

  async filterCategory(category?: outfitCategories) {

    if (!category) {
      await this.loadCategories();
      await this.loadProducts();
      return
    }

    if (!category.parentCategory) {
      await this.loadProducts(category.id);
      await this.loadCategories(category.id)
      return
    }

    if (category.parentCategory) {
      this.loadProducts(category.parentCategory, category.id);
    }
  }
  // Funzione link allo store
  buyToStore(_t31: any) {
    throw new Error('Method not implemented.');
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
