import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppService } from './app-service';
import { categoryCloth, outfitCategories } from './interface/outfit-all-interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private categoryCache = new Map<any, string>(); // Cache delle categorie
  categorySubject = new BehaviorSubject<categoryCloth>({ id: 0, value: '', parent: null });
  categoriesSubject = new BehaviorSubject<outfitCategories[]>([])

  constructor(private appService: AppService) {}

  /**
   * Fetches categories based on the provided parent ID.
   * If the categories are already cached, they are returned from the cache.
   * Otherwise, a HTTP request is made to retrieve the categories.
   *
   * @param idParent - The ID of the parent category. If not provided, all categories will be fetched.
   * @returns A Promise that resolves to the fetched categories.
   *
   * @throws Will throw an error if the HTTP request fails.
   */
  async fetchCategories(idParent?: any, gender?:any): Promise<any[]> {
    let queryString = '';
    let concat = ''
    if(idParent)
      queryString = `/${idParent}`;


    if(gender){
      concat =  '?'
      queryString =  `${queryString}${concat}gender=${gender}`;
    }

    const categories = await this.appService.getData('outfitAllCategories', queryString);
    console.log('categories',categories)
    this.categoriesSubject.next(categories);

    return categories;
  }

  async categoriesByParent(idParent?: any, gender?:any): Promise<any[]> {
    let queryString = '';
    let concat = ''
    if(idParent)
      queryString = `/${idParent}`;


    if(gender){
      concat =  '?'
      queryString =  `${queryString}${concat}gender=${gender}`;
    }

    const categories = await this.appService.getData('outfitCategories', queryString);

    //this.categoriesSubject.next(categories);

    return categories;
  }


  /**
   * Recupera il nome della categoria dato l'ID.
   * Effettua una chiamata HTTP solo se l'ID non è in cache.
   */
  async fetchCategory(idCategory: any): Promise<string> {
    if (this.categoryCache.has(idCategory)) {
      return this.categoryCache.get(idCategory)!;
    }

    const queryString = `/${idCategory}`;
    const category = await this.appService.getData('outfitCategory', queryString);
    const categoryName = category.categoryName ;

    // Aggiunge la categoria alla cache e aggiorna il BehaviorSubject
    this.categoryCache.set(idCategory, categoryName);
    this.categorySubject.next(category);


    return categoryName;
  }

  /**
   * Ottieni l'osservabile della cache aggiornata.
   */
  getCategoryCache$() {
    return this.categorySubject.asObservable();
  }
}
