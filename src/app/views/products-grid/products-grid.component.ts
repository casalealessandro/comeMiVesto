import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { AppService } from 'src/app/service/app-service';
import { CategoryService } from 'src/app/service/category.service';
import { Tag } from 'src/app/service/interface/outfit-all-interface';

@Component({
  selector: 'app-products-grid',
  templateUrl: './products-grid.component.html',
  styleUrls: ['./products-grid.component.scss'],
})
export class ProductsGridComponent implements  OnChanges {
  @Input() products: Tag[] = [];
  @Input() showRemoveBtn: boolean = false;
  @Input() showSaveBtn: boolean = true;
  @Output() productsEvent = new EventEmitter<any>();
  constructor(private categoryService:CategoryService) { }
  
  categoryNames = new Map<any, string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products'] && this.products) {
      this.loadCategoryNames();
    }
  }

  
  /**
   * Precarica i nomi delle categorie per tutti i prodotti.
   */
  async loadCategoryNames(): Promise<void> {
    console.log(this.products);
    if (!this.products || this.products.length === 0) {
      console.warn('Nessun prodotto disponibile per il caricamento delle categorie.');
      return;
    }
    const uniqueCategoryIds = [...new Set(this.products.map(p => p.outfitSubCategory))];

    for (const idCategory of uniqueCategoryIds) {
      const categoryName = await this.categoryService.fetchCategory(idCategory);
      this.categoryNames.set(idCategory, categoryName);
    }
  }



  async buyToStore(itm: any) {
    let link = !itm.link ? '#' : itm.link

    if (link != '#') {
      await Browser.open({ url: link });
    }
  }

    /**
   * Restituisce il nome della categoria per un ID.
   */
   getCategoryText(idCategory:any):string{
    return this.categoryNames.get(idCategory) || 'Caricamento...';
  }
  saveToWardrobe(evt:MouseEvent,product:any){
    evt.stopImmediatePropagation();
    evt.preventDefault();
    const dataTosend = {
      name:'saveToWardrobe',
      data: product
    }
    this.productsEvent.emit(dataTosend)
  }

  removeProduct(evtProduct:any){

    const dataTosend = {
      name:'removeProduct',
      data: evtProduct
    }
    this.productsEvent.emit(dataTosend)
  }
  
}
