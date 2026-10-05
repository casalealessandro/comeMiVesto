import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { AppCatalogProduct } from 'src/app/service/app-service';
import { CategoryService } from 'src/app/service/category.service';
import { Tag, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-products-grid',
  templateUrl: './products-grid.component.html',
  styleUrls: ['./products-grid.component.scss'],
})
export class ProductsGridComponent implements  OnChanges {
  @Input() products: Array<Tag | AppCatalogProduct | wardrobesItem> = [];
  @Input() showRemoveBtn: boolean = false;
  @Input() showSaveBtn: boolean = true;
  @Input() openProductDetail: boolean = false;
  @Input() horizontalScroll: boolean = false;
  @Input() busyProductIds: ReadonlySet<string> | string[] = [];
  @Output() productsEvent = new EventEmitter<any>();
  constructor(private categoryService:CategoryService, private router: Router) { }
  
  categoryNames = new Map<any, string>();
  private feedbackProductId = '';
  private feedbackTimer?: ReturnType<typeof setTimeout>;

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



  async buyToStore(evt: MouseEvent, itm: any) {
    evt.stopImmediatePropagation();
    evt.preventDefault();
    let link = !itm.link ? '#' : itm.link

    if (link != '#') {
      await Browser.open({ url: link });
    }
  }

  openProduct(evt: MouseEvent, product: Tag | AppCatalogProduct | wardrobesItem) {
    if (this.isProductBusy(product)) {
      evt.stopImmediatePropagation();
      evt.preventDefault();
      return;
    }

    this.showTapFeedback(product);

    if (!this.openProductDetail) {
      this.saveToWardrobe(evt, product);
      return;
    }

    evt.stopImmediatePropagation();
    evt.preventDefault();

    const catalogProductId = 'catalogProductId' in product && product.catalogProductId
      ? product.catalogProductId
      : 'affiliateProgramId' in product
        ? String(product.id)
        : '';

    if (!catalogProductId) {
      void this.buyToStore(evt, product);
      return;
    }

    void this.router.navigate(['/tabs/product', catalogProductId]);
  }

  getProductPrice(product: Tag | AppCatalogProduct | wardrobesItem): number | undefined {
    const price = 'price' in product ? product.price : undefined;
    return price ?? product.prezzo;
  }

  hasStoreLink(product: Tag | AppCatalogProduct | wardrobesItem): boolean {
    return Boolean(product.link && product.link !== '#');
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

    if (this.isProductBusy(product)) return;

    this.showTapFeedback(product);
    const dataTosend = {
      name:'saveToWardrobe',
      data: product
    }
    this.productsEvent.emit(dataTosend)
  }

  productKey(product: Tag | AppCatalogProduct | wardrobesItem): string {
    const catalogProductId = 'catalogProductId' in product && product.catalogProductId
      ? String(product.catalogProductId)
      : '';
    if (catalogProductId) return catalogProductId;

    return 'id' in product && product.id ? String(product.id) : '';
  }

  isProductBusy(product: Tag | AppCatalogProduct | wardrobesItem): boolean {
    const key = this.productKey(product);
    if (!key) return false;
    return Array.isArray(this.busyProductIds)
      ? this.busyProductIds.includes(key)
      : this.busyProductIds.has(key);
  }

  isProductInFeedback(product: Tag | AppCatalogProduct | wardrobesItem): boolean {
    return Boolean(this.feedbackProductId && this.feedbackProductId === this.productKey(product));
  }

  private showTapFeedback(product: Tag | AppCatalogProduct | wardrobesItem) {
    const key = this.productKey(product);
    if (!key) return;

    this.feedbackProductId = key;
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      if (this.feedbackProductId === key) this.feedbackProductId = '';
    }, 220);
  }

  removeProduct(evt:MouseEvent,evtProduct:any){
    evt.stopImmediatePropagation();
    evt.preventDefault();
    const dataTosend = {
      name:'removeProduct',
      data: evtProduct
    }
    this.productsEvent.emit(dataTosend)
  }
  
}
