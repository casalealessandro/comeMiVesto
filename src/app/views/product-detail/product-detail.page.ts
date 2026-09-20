import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { firstValueFrom } from 'rxjs';
import { AppCatalogProduct, AppService } from 'src/app/service/app-service';
import { CategoryService } from 'src/app/service/category.service';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { UserService } from 'src/app/service/user.service';
import { outfit, Tag } from 'src/app/service/interface/outfit-all-interface';

interface ProductSuggestionGroup {
  title: string;
  products: AppCatalogProduct[];
}

@Component({
  standalone: false,
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  product?: AppCatalogProduct;
  selectedImage = '';
  categoryName = '';
  subCategoryName = '';
  relatedGroups: ProductSuggestionGroup[] = [];
  similarProducts: AppCatalogProduct[] = [];
  isLoading = true;
  isRelatedLoading = false;
  loadError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    private categoryService: CategoryService,
    private userProfileService: UserService,
    private sharedData: SharedDataService
  ) {}

  ngOnInit(): void {
    this.sharedData.setData({
      componentName: 'HeaderComponent',
      data: {
        showLogo: false,
        showUserInfo: false,
        titleText: 'Dettaglio prodotto',
        showTitleText: true,
        canGoBack: true
      }
    });

    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) void this.loadProduct(productId);
    });
  }

  get productImages(): string[] {
    if (!this.product) return [];
    const images = [
      ...(Array.isArray(this.product.images) ? this.product.images : []),
      this.product.imageUrl
    ].filter((image): image is string => typeof image === 'string' && image.trim().length > 0);

    return [...new Set(images)];
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  async buyToStore(): Promise<void> {
    if (!this.product?.link) return;
    await Browser.open({ url: this.product.link });
  }

  async saveToWardrobe(): Promise<void> {
    if (!this.product) return;

    const saved = await this.appService.createWardrobe({
      catalogProductId: this.product.id,
      brend: this.product.brend,
      images: this.productImages,
      imageUrl: this.product.imageUrl,
      name: this.product.name,
      outfitCategory: this.product.outfitCategory,
      outfitSubCategory: this.product.outfitSubCategory,
      color: this.product.color,
      prezzo: this.product.prezzo ?? this.product.price,
      link: this.product.link || '#'
    });

    if (saved) {
      alert('Elemento aggiunto alla tua wardrobe con successo!');
    }
  }

  showOutfitMatches(): void {
    if (!this.product) return;

    void this.router.navigate(['/tabs/myoutfit'], {
      queryParams: {
        source: 'product',
        outfitCategory: this.product.outfitCategory,
        outfitSubCategory: this.product.outfitSubCategory,
        color: this.product.color
      }
    });
  }

  openProduct(product: AppCatalogProduct): void {
    void this.router.navigate(['/tabs/product', product.id]);
  }

  private async loadProduct(productId: string): Promise<void> {
    this.isLoading = true;
    this.loadError = false;
    this.relatedGroups = [];
    this.similarProducts = [];

    try {
      this.product = await this.appService.getOutfitProduct(productId);
      this.selectedImage = this.productImages[0] || 'assets/images/fallback-image.jpg';

      await Promise.all([
        this.loadTaxonomyNames(),
        this.loadRelatedProducts()
      ]);
    } catch (error) {
      console.error('Impossibile caricare il dettaglio prodotto:', error);
      this.product = undefined;
      this.loadError = true;
    } finally {
      this.isLoading = false;
    }
  }

  private async loadTaxonomyNames(): Promise<void> {
    if (!this.product) return;

    const [categoryName, subCategoryName] = await Promise.all([
      this.safeCategoryName(this.product.outfitCategory),
      this.safeCategoryName(this.product.outfitSubCategory)
    ]);

    this.categoryName = categoryName;
    this.subCategoryName = subCategoryName;
  }

  private async loadRelatedProducts(): Promise<void> {
    if (!this.product) return;

    this.isRelatedLoading = true;
    try {
      const profile = this.userProfileService.gUserProfile()();
      const gender = profile?.gender || this.product.genderTargets?.[0] || '';
      const queryString = gender ? `gender=${encodeURIComponent(gender)}` : '';
      const matchedOutfits = await firstValueFrom(this.appService.getFilteredOutfits(queryString, {
        categories: [{
          outfitCategory: this.product.outfitCategory,
          outfitSubCategory: this.product.outfitSubCategory,
          color: this.product.color
        }]
      }));

      const subCategoryCounts = this.relatedSubCategoryCounts(matchedOutfits ?? []);
      const relatedSubCategories = [...subCategoryCounts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 2)
        .map(([subCategory]) => subCategory);

      const groups: ProductSuggestionGroup[] = [];
      for (const subCategory of relatedSubCategories) {
        const response = await this.appService.filterOutfitProducts({
          outfitSubCategory: [subCategory],
          ...(gender ? { gender } : {}),
          limit: 6
        });
        const products = response.data.filter(product => product.id !== this.product?.id).slice(0, 6);
        if (!products.length) continue;
        groups.push({
          title: await this.safeCategoryName(subCategory),
          products
        });
      }
      this.relatedGroups = groups;

      const similarResponse = await this.appService.filterOutfitProducts({
        outfitSubCategory: [this.product.outfitSubCategory],
        ...(gender ? { gender } : {}),
        limit: 7
      });
      this.similarProducts = similarResponse.data
        .filter(product => product.id !== this.product?.id)
        .slice(0, 6);
    } catch (error) {
      console.error('Impossibile caricare i prodotti correlati:', error);
      this.relatedGroups = [];
      this.similarProducts = [];
    } finally {
      this.isRelatedLoading = false;
    }
  }

  private relatedSubCategoryCounts(outfits: outfit[]): Map<string, number> {
    const counts = new Map<string, number>();
    const currentSubCategory = this.product?.outfitSubCategory;

    outfits.forEach(currentOutfit => {
      const uniqueSubCategories = new Set(
        (currentOutfit.tags ?? [])
          .map((tag: Tag) => tag.outfitSubCategory)
          .filter((subCategory): subCategory is string => Boolean(subCategory) && subCategory !== currentSubCategory)
      );

      uniqueSubCategories.forEach(subCategory => {
        counts.set(subCategory, (counts.get(subCategory) ?? 0) + 1);
      });
    });

    return counts;
  }

  private async safeCategoryName(categoryId?: string): Promise<string> {
    if (!categoryId) return '';
    try {
      return await this.categoryService.fetchCategory(categoryId);
    } catch {
      return categoryId;
    }
  }
}
