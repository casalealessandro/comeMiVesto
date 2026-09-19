import { Component, DestroyRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { InfiniteScrollCustomEvent, IonInfiniteScroll, ModalController, NavController } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';

import { AppService } from 'src/app/service/app-service';
import { CategoryService } from 'src/app/service/category.service';
import { AppCatalogProduct, CatalogProductFilters, outfitCategories } from 'src/app/service/interface/outfit-all-interface';
import { FirebaseService } from 'src/app/service/firebase.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  standalone: false,
  selector: 'app-prodotti-online',
  templateUrl: './prodotti-online.page.html',
  styleUrls: ['./prodotti-online.page.scss'],
})
export class ProdottiOnlinePage implements OnInit {
  @Input() showHeader: boolean = false;
  @ViewChild(IonInfiniteScroll) infiniteScroll?: IonInfiniteScroll;

  constructor(
    private modalController: ModalController,
    private categoryService: CategoryService,
    private navController: NavController,
    private firebase: FirebaseService,
    private userProfileService: UserService,
  ) { }

  private appService = inject(AppService);
  private destroyRef = inject(DestroyRef);
  private readonly productsLimit = 20;

  userProfile$ = this.userProfileService.gUserProfile();

  public products: AppCatalogProduct[] = [];
  public categories?: outfitCategories[];
  nextCursor: string | null = null;
  hasMore = true;
  isLoading = false;
  userID: any;
  gender = '';
  outfitCategory = '';
  outfitSubCategory = '';
  selectedCategoryName = 'Tutti i prodotti';
  selectedFilterStyleIndex?: number;
  isModal: boolean = true;

  ngOnInit() {
    this.firebase.authState.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async user => {
      if (user) {
        this.userID = this.userProfile$()?.uid;
        this.gender = this.userProfile$()?.gender || '';

        this.categoryService.categoriesSubject
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((categories: outfitCategories[]) => {
            this.categories = categories;
          });

        this.resetPagination();
        await this.loadProducts();
      } else {
        this.handleBackButton();
      }
    });

    setTimeout(async () => {
      const modal = await this.modalController.getTop();
      if (!modal) {
        this.isModal = false;
      }
    }, 500);
  }

  async loadProducts(
    outfitCategory: string = this.outfitCategory,
    outfitSubCategory: string = this.outfitSubCategory,
    append = false,
  ): Promise<void> {
    if (this.isLoading || (append && !this.hasMore)) {
      return;
    }

    this.isLoading = true;

    try {
      const gender = this.catalogGender();
      const cursor = append ? this.nextCursor ?? undefined : undefined;

      let response;
      if (outfitCategory || outfitSubCategory) {
        const filters: CatalogProductFilters = {
          ...(outfitCategory ? { outfitCategory: [outfitCategory] } : {}),
          ...(outfitSubCategory ? { outfitSubCategory: [outfitSubCategory] } : {}),
          ...(gender ? { gender } : {}),
          limit: this.productsLimit,
          ...(cursor ? { cursor } : {}),
        };
        response = await this.appService.filterOutfitProducts(filters);
      } else {
        response = await this.appService.getOutfitProducts({
          ...(gender ? { gender } : {}),
          limit: this.productsLimit,
          ...(cursor ? { cursor } : {}),
        });
      }

      this.products = append
        ? this.mergeProducts(this.products, response.data)
        : response.data;
      this.nextCursor = response.pagination.nextCursor;
      this.hasMore = response.pagination.hasMore;

      if (this.infiniteScroll) {
        this.infiniteScroll.disabled = !this.hasMore;
      }
    } catch (error) {
      console.error('Errore durante il caricamento dei prodotti', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadCategories(parent?: any) {
    if (!parent) {
      this.categoryService.categoriesSubject
        .pipe(take(1))
        .subscribe((categories: outfitCategories[]) => {
          this.categories = categories;
        });
      return;
    }

    this.categories = await this.categoryService.categoriesByParent(parent, this.gender);
    console.log('categories', this.categories);
  }

  async filterCategory(indexCategory?: number, category?: outfitCategories) {
    this.selectedFilterStyleIndex = undefined;

    if (!category) {
      this.selectedCategoryName = 'Tutti i prodotti';
      this.outfitCategory = '';
      this.outfitSubCategory = '';
      this.resetPagination();
      await this.loadCategories();
      await this.loadProducts();
      return;
    }

    this.selectedCategoryName = category.categoryName;

    if (!category.parentCategory) {
      this.outfitCategory = String(category.id);
      this.outfitSubCategory = '';
      this.resetPagination();
      await this.loadProducts();
      await this.loadCategories(category.id);
      return;
    }

    this.selectedFilterStyleIndex = indexCategory;
    this.outfitCategory = String(category.parentCategory);
    this.outfitSubCategory = String(category.id);
    this.resetPagination();
    await this.loadProducts();
  }

  async buyToStore(itm: AppCatalogProduct) {
    const link = !itm.link ? '#' : itm.link;

    if (link !== '#') {
      await Browser.open({ url: link });
    }
  }

  async loadMoreProducts(event: InfiniteScrollCustomEvent): Promise<void> {
    if (this.isLoading || !this.hasMore) {
      await event.target.complete();
      if (!this.hasMore) {
        event.target.disabled = true;
      }
      return;
    }

    try {
      await this.loadProducts(this.outfitCategory, this.outfitSubCategory, true);
    } finally {
      await event.target.complete();
      event.target.disabled = !this.hasMore;
    }
  }

  async saveToWardrobe(dataProduct: any) {
    const data = dataProduct.data as AppCatalogProduct;
    const link = !data.link ? '#' : data.link;

    const saveData = {
      brend: data.brend,
      images: Array.isArray(data.images) ? data.images : data.imageUrl ? [data.imageUrl] : [],
      imageUrl: data.imageUrl,
      name: data.name,
      outfitCategory: data.outfitCategory,
      outfitSubCategory: data.outfitSubCategory,
      color: data.color,
      prezzo: data.prezzo ?? data.price,
      link,
    };

    const resSave = await this.appService.createWardrobe(saveData);
    if (resSave) {
      alert('Elemento aggiunto alla tua wardrobe con successo!');
    }
  }

  async handleBackButton() {
    const modal = await this.modalController.getTop();
    if (modal) {
      modal.dismiss();
    } else {
      this.navController.back();
    }
  }

  genderReveral(gen: string): string {
    switch (gen) {
      case 'D':
        return ' Donna ';
      case 'U':
        return ' Uomo ';
      default:
        return '';
    }
  }

  private resetPagination(): void {
    this.products = [];
    this.nextCursor = null;
    this.hasMore = true;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  private catalogGender(): 'U' | 'D' | undefined {
    return this.gender === 'U' || this.gender === 'D' ? this.gender : undefined;
  }

  private mergeProducts(current: AppCatalogProduct[], incoming: AppCatalogProduct[]): AppCatalogProduct[] {
    const products = new Map<string, AppCatalogProduct>();
    [...current, ...incoming].forEach(product => products.set(product.id, product));
    return [...products.values()];
  }
}
