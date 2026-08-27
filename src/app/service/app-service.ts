import { Injectable, signal } from '@angular/core';
import { DynamicFormField } from './interface/dynamic-form-field';
import { lastValueFrom, Observable, throwError } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { UserProfile } from './interface/user-interface';
import { EditableOutfit, OutfitFilterPayload, ReportPayload, WardrobePayload, outfit, wardrobesItem } from './interface/outfit-all-interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}


@Injectable({
  providedIn: 'root'
})


export class AppService {
  private batchSize = 20;
  private lastDocument: any | null = null;
  private apiFire = `${environment.BASE_API_URL}/gen/`
  //private apiFire = "http://localhost:5001/comemivesto-5e5f9/us-central1/api/gen/"
  //private apiFire = "http://localhost:5001/comemivesto-5e5f9/us-central1/api/"
   // Crea un Signal per il wardrobe
  resultsSignal = signal<any[]>([]);
  // Crea Signals per categoria e colore
  selectedProduct = signal<string | null>(null);
  

  constructor(private storage: AngularFireStorage, private http:HttpClient) { }

  private normalizeQueryString(queryString: string = ''): string {
    if (!queryString) {
      return '';
    }
    return queryString.startsWith('?') ? queryString.slice(1) : queryString;
  }

  getFormFields(nomeAnagrafica: string): Observable<DynamicFormField[]> {
    return this.http.get<ApiResponse<DynamicFormField[]>>(`${this.apiFire}forms/${encodeURIComponent(nomeAnagrafica)}`).pipe(
      map(response => {
        if (!Array.isArray(response?.data)) {
          throw new Error('Il form ricevuto non è valido.');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  async getData(api:string,queryString:string):Promise<any>{
    const normalizedQuery = this.normalizeQueryString(queryString);
    const querySuffix = !queryString
      ? ''
      : queryString.startsWith('/')
        ? queryString
        : `?${normalizedQuery}`;

    const completeApi = `${this.apiFire}${api}${querySuffix}`
    const call = this.http.get(completeApi)

    const response: any = await lastValueFrom(call)
    return response?.data ?? response
  }
  getAllData(api: string, queryString: string = ''): Observable<any> {
    const normalizedQuery = this.normalizeQueryString(queryString);
    // Composizione dell'URL completo
    const completeApi = `${this.apiFire}${api}${normalizedQuery ? '?' + normalizedQuery : ''}`;
    
    // Chiamata HTTP
    return this.http.get<any>(completeApi).pipe(map(response => response?.data ?? response));
  }

   /**
   * Ottiene tutti i outfits con gestione avanzata degli errori e logging.
   * @returns Observable<oufits[]> - Lista di outfits.
   */
   getAll<T>(api: string, queryString: string = ''): Observable<T[]> {
     const normalizedQuery = this.normalizeQueryString(queryString);
     const completeApi = `${this.apiFire}${api}${normalizedQuery ? '?' + normalizedQuery : ''}`;
     return this.http.get<ApiResponse<T[]>>(completeApi).pipe(
       retry(3),
       tap(() => console.info('Richiesta all’API effettuata con successo')),
       map((response: any) => response.data),
       catchError(this.handleError)
     );
   }

   /**
   * Metodo generico per inviare dati al server tramite POST.
   * @param url - L'endpoint API.
   * @param payload - I dati da inviare.
   * @returns Observable<T> - L'oggetto generico restituito dalla risposta.
   */
  create<TPayload, TResult = TPayload>(api: string, payloadData: TPayload): Observable<TResult> {
    const completeApi = `${this.apiFire}${api}`;
    return this.http.post<ApiResponse<TResult>>(completeApi, payloadData).pipe(
      map((response) => response.data),
      catchError(this.handleError),
      tap(() => console.info('Richiesta all’API effettuata con successo'))
    );
  }

  getOutfit(id: string): Promise<outfit> {
    return lastValueFrom(this.http.get<ApiResponse<outfit>>(`${this.apiFire}outfits/${encodeURIComponent(id)}`).pipe(map(r => r.data), catchError(this.handleError)));
  }

  getUserOutfits(): Observable<outfit[]> { return this.getAll<outfit>('user-outfits'); }
  createOutfit(payload: EditableOutfit): Promise<outfit> { return lastValueFrom(this.http.post<ApiResponse<outfit>>(`${this.apiFire}outfits`, this.editableOutfitPayload(payload)).pipe(map(r => r.data), catchError(this.handleError))); }
  updateOutfit(id: string, payload: EditableOutfit): Promise<outfit> { return lastValueFrom(this.http.put<ApiResponse<outfit>>(`${this.apiFire}outfits/${encodeURIComponent(id)}`, this.editableOutfitPayload(payload)).pipe(map(r => r.data), catchError(this.handleError))); }
  deleteOutfit(id: string): Promise<boolean> { return lastValueFrom(this.http.delete<ApiResponse<unknown>>(`${this.apiFire}outfits/${encodeURIComponent(id)}`).pipe(map(() => true), catchError(this.handleError))); }
  recordOutfitVisit(id: string): Promise<outfit> { return lastValueFrom(this.http.post<ApiResponse<outfit>>(`${this.apiFire}outfits/${encodeURIComponent(id)}/visit`, {}).pipe(map(r => r.data), catchError(this.handleError))); }
  filterOutfitProducts(filters: { ids?: string[]; outfitCategory?: string[]; outfitSubCategory?: string[] }): Promise<any[]> { return lastValueFrom(this.http.post<ApiResponse<any[]>>(`${this.apiFire}filter-outfit-products`, filters).pipe(map(r => r.data), catchError(this.handleError))); }
  getWardrobes(): Observable<wardrobesItem[]> { return this.getAll<wardrobesItem>('wardrobes'); }
  getWardrobe(id: string): Promise<wardrobesItem> { return lastValueFrom(this.http.get<ApiResponse<wardrobesItem>>(`${this.apiFire}wardrobes/${encodeURIComponent(id)}`).pipe(map(r => r.data), catchError(this.handleError))); }
  createWardrobe(data: WardrobePayload): Promise<wardrobesItem> { return lastValueFrom(this.http.post<ApiResponse<wardrobesItem>>(`${this.apiFire}wardrobes`, this.wardrobePayload(data, true)).pipe(map(r => r.data), catchError(this.handleError))); }
  updateWardrobe(id: string, data: Partial<WardrobePayload>): Promise<wardrobesItem> { return lastValueFrom(this.http.put<ApiResponse<wardrobesItem>>(`${this.apiFire}wardrobes/${encodeURIComponent(id)}`, this.wardrobePayload(data, false)).pipe(map(r => r.data), catchError(this.handleError))); }
  deleteWardrobe(id: string): Promise<boolean> { return lastValueFrom(this.http.delete(`${this.apiFire}wardrobes/${encodeURIComponent(id)}`).pipe(map(() => true), catchError(this.handleError))); }
  createReport(data: ReportPayload): Promise<unknown> { const payload = { outFitId: data.outFitId, outfitUserId: data.outfitUserId, typeSegnaletion: data.typeSegnaletion }; return lastValueFrom(this.http.post<ApiResponse<unknown>>(`${this.apiFire}reports`, payload).pipe(map(r => r.data), catchError(this.handleError))); }
  getPublicUserProfile(uid: string): Observable<UserProfile> { return this.http.get<ApiResponse<UserProfile>>(`${this.apiFire}public-user-profile/${encodeURIComponent(uid)}`).pipe(map(r => r.data), catchError(this.handleError)); }

   getFilteredOutfits(queryString:string,conditions: OutfitFilterPayload): Observable<outfit[]> {
    const completeApi = `${this.apiFire}filter-outfits?${queryString}`;
    const payload: OutfitFilterPayload = {
      categories: (conditions.categories ?? []).map(({ outfitCategory, outfitSubCategory, color }) => {
        const category: { outfitCategory?: string; outfitSubCategory?: string; color?: string } = {};
        if (outfitCategory) category.outfitCategory = outfitCategory;
        if (outfitSubCategory) category.outfitSubCategory = outfitSubCategory;
        if (color) category.color = color;
        return category;
      }).filter(category => Object.keys(category).length > 0),
      ...(conditions.season ? { season: conditions.season } : {}),
      ...(conditions.style ? { style: conditions.style } : {})
    };
    return this.http.post<ApiResponse<any>>(completeApi,payload).pipe(
      tap(() => console.info('Richiesta all’API effettuata con successo')),
      map((response: any) => response.data),
      catchError(this.handleError)
    );
  }
   getSuggestOutfits(queryString:string,conditions: any): Observable<outfit[]> {
    const completeApi = `${this.apiFire}preference-outfits?${queryString}`;
    return this.http.post<ApiResponse<any>>(completeApi,conditions).pipe(
      tap(() => console.info('Richiesta all’API effettuata con successo')),
      map((response: any) => response.data),
      catchError(this.handleError)
    );
  }


  /**
   * Gestisce gli errori HTTP e ritorna un Observable che l'utente può consumare.
   * @param error - L'errore ricevuto dalla richiesta HTTP.
   * @returns Observable<never> - Observable che rappresenta un errore.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let userFriendlyMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Errore lato client
      console.error('Errore client-side:', error.error.message);
      userFriendlyMessage = 'Si è verificato un problema di rete. Riprova più tardi.';
    } else {
      // Errore lato server
      console.error(
        `Errore server-side: codice ${error.status}, messaggio: ${error.message}`
      );
      switch (error.status) {
        case 400:
          userFriendlyMessage = 'I dati inviati non sono validi.';
          break;
        case 401:
          userFriendlyMessage = 'La sessione è scaduta. Accedi nuovamente.';
          break;
        case 403:
          userFriendlyMessage = 'Non sei autorizzato a eseguire questa operazione.';
          break;
        case 404:
          userFriendlyMessage = 'Risorsa non trovata.';
          break;
        case 409:
          userFriendlyMessage = 'La risorsa è già presente.';
          break;
        case 500:
          userFriendlyMessage = 'Errore interno del server. Riprova più tardi.';
          break;
        default:
          userFriendlyMessage = 'Si è verificato un errore imprevisto. Contatta il supporto.';
      }
    }

    return throwError(() => new ApiRequestError(userFriendlyMessage, error.status));
  }

  getUserProfilebyId(userUid: any): Observable<UserProfile> {
    return this.getPublicUserProfile(userUid);
  }
  private editableOutfitPayload(data: EditableOutfit): EditableOutfit {
    const allowed: Array<keyof EditableOutfit> = ['title', 'description', 'imageUrl', 'tags', 'gender', 'style', 'season'];
    return allowed.reduce((payload, field) => {
      if (Object.prototype.hasOwnProperty.call(data, field) && data[field] !== undefined) {
        (payload as any)[field] = data[field];
      }
      return payload;
    }, {} as EditableOutfit);
  }

  private wardrobePayload(data: Partial<WardrobePayload>, normalizeMissingImages: boolean): Partial<WardrobePayload> {
    const allowed = ['name', 'outfitCategory', 'outfitSubCategory', 'brend', 'color', 'images', 'imageUrl', 'ImageUrl', 'prezzo', 'link'] as const;
    const payload: any = {};
    allowed.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(data, field) && data[field] !== undefined) payload[field] = data[field];
    });
    const hasImageInput = Object.prototype.hasOwnProperty.call(data, 'images')
      || Object.prototype.hasOwnProperty.call(data, 'imageUrl')
      || Object.prototype.hasOwnProperty.call(data, 'ImageUrl');
    if (normalizeMissingImages || hasImageInput) {
      const fallbackImage = data.imageUrl || data.ImageUrl;
      payload.images = Array.isArray(data.images) ? data.images : fallbackImage ? [fallbackImage] : [];
    }
    return payload;
  }

  // Caricamento dell'immagine in Firebase Storage

  async uploadImage(filePath: Blob, fileName: string, contentType: string): Promise<string> {
    const fileRef = this.storage.ref(fileName);
    let metaData = {
      contentType: contentType
    }

    const task = this.storage.upload(fileName, filePath, metaData);

    try {
      await task;  // Assicurati che l'upload sia completato prima di ottenere l'URL
      let downloadURL = await lastValueFrom(fileRef.getDownloadURL())

      return downloadURL;
    } catch (error) {
      throw new Error('Errore durante il caricamento dell\'immagine: ' + error);
    }
  }
}
