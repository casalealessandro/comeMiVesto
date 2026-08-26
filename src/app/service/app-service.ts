import { Injectable, signal } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DynamicFormField } from './interface/dynamic-form-field';
import { lastValueFrom, Observable, throwError } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertController } from '@ionic/angular';
import { UserProfile } from './interface/user-interface';
import { FireBaseConditions, outfit } from './interface/outfit-all-interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
export interface ApiResponse<T> {
  message: string;
  data: T;
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
  

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage, private alertController: AlertController, private http:HttpClient) { }

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
  createOutfit(payload: Partial<outfit>): Promise<outfit> { return lastValueFrom(this.http.post<ApiResponse<outfit>>(`${this.apiFire}outfits`, payload).pipe(map(r => r.data), catchError(this.handleError))); }
  updateOutfit(id: string, payload: Partial<outfit>): Promise<outfit> { return lastValueFrom(this.http.put<ApiResponse<outfit>>(`${this.apiFire}outfits/${encodeURIComponent(id)}`, payload).pipe(map(r => r.data), catchError(this.handleError))); }
  deleteOutfit(id: string): Promise<boolean> { return lastValueFrom(this.http.delete<ApiResponse<unknown>>(`${this.apiFire}outfits/${encodeURIComponent(id)}`).pipe(map(() => true), catchError(this.handleError))); }
  recordOutfitVisit(id: string): Promise<outfit> { return lastValueFrom(this.http.post<ApiResponse<outfit>>(`${this.apiFire}outfits/${encodeURIComponent(id)}/visit`, {}).pipe(map(r => r.data), catchError(this.handleError))); }
  filterOutfitProducts(filters: { ids?: string[]; outfitCategory?: string[]; outfitSubCategory?: string[] }): Promise<any[]> { return lastValueFrom(this.http.post<ApiResponse<any[]>>(`${this.apiFire}filter-outfit-products`, filters).pipe(map(r => r.data), catchError(this.handleError))); }
  getPublicUserProfile(uid: string): Observable<UserProfile> { return this.http.get<ApiResponse<UserProfile>>(`${this.apiFire}public-user-profile/${encodeURIComponent(uid)}`).pipe(map(r => r.data), catchError(this.handleError)); }

   getFilteredOutfits(queryString:string,conditions: any): Observable<outfit[]> {
    const completeApi = `${this.apiFire}filter-outfits?${queryString}`;
    return this.http.post<ApiResponse<any>>(completeApi,conditions).pipe(
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

    return throwError(() => new Error(userFriendlyMessage));
  }

  getUserProfilebyId(userUid: any): Observable<UserProfile> {
    return this.getPublicUserProfile(userUid);
  }

  async getFilteredCollection(collection: string, conditions?:FireBaseConditions[],orderBy?:any[]): Promise<any> {
    
    let query: any = this.firestore.collection(collection).ref;
    
    if(conditions){
      // Applica tutte le condizioni alla query 
      conditions.forEach(condition => {
        
        query = query.where(condition.field, condition.operator, condition.value);
        //console.log('conditions-->',query)
      });
    }

    if(orderBy){
      // Applica l'ordinamento alla query
      orderBy.forEach(order => {
        query = query.orderBy(order.field, order.by);
      });
    }
     
    
    try {
      
      const querySnapshot = await query.get();

      const results = querySnapshot.docs.map((doc: any) => doc.data());
      //this.resultsSignal.set(results);
      this.resultsSignal.set(results)
      return results;
    } catch (error) {
      console.error('Error getting filtered collection:', error);
      this.resultsSignal.set([]);

      return [];
    }



  }

  async getMultiFiltered(collection: string,conditions: FireBaseConditions[]): Promise<any[]> {
    
    const db: any = this.firestore.collection(collection).ref;
    
   
    
    const queryPromises: Promise<any>[] = [];

    // Raggruppa le condizioni in base all'operatore
    const simpleConditions = conditions.filter(c => c.operator === '==');
    const arrayConditions = conditions.filter(c => c.operator === 'array-contains-any');

    // Esegui query per condizioni semplici (==)
    let baseQuery 
    if (simpleConditions.length > 0) {
      simpleConditions.forEach((condition:any) => {
       // query =  query.where(condition.field, condition.operator, condition.value);
        const query = db.where(condition.field, condition.operator, condition.value);
        queryPromises.push(query.get());
      });
    }
    
    

    // Esegui query separate per ciascuna condizione con 'array-contains-any'
    arrayConditions.forEach((condition:any) => {
      const query = db.where(condition.field, condition.operator, condition.value);
      queryPromises.push(query.get());
    });

    try {
      // Attendi tutte le query
      const querySnapshots = await Promise.all(queryPromises);

      // Estrai i dati da ogni querySnapshot
      let combinedResults: any[] = [];
      querySnapshots.forEach(snapshot => {
        snapshot.docs.forEach((doc:any) => {
          combinedResults.push(doc.data());
        });
      });

      // Rimuovi i duplicati basandoti sull'id del documento
      const uniqueResults = Array.from(new Set(combinedResults.map(item => item.id)))
        .map(id => combinedResults.find(item => item.id === id));
        //this.resultsSignal.set(uniqueResults);
      return uniqueResults;
    } catch (error) {
      console.error("Error getting filtered collection: ", error);
      return [];
    }
  }

  

  //Salvataggio in FireStone

  async saveInCollection(collection: string, nameDoc: string | undefined, data: any): Promise<boolean> {
    
    try {
      const Collection = await this.firestore.collection(collection)
      if (!nameDoc) {
        Collection.add(data);
        this.getFilteredCollection(collection,[])
        return true
      } else {
        this.getFilteredCollection(collection,[])
        Collection.doc(nameDoc).set(data);
        return true
      }
      
    } catch (error) {

      const alert = await this.alertController.create({
        header: 'Attenzione',
        subHeader: '',
        message: `Errore durante il salvataggio del documento:, ${error}`,
        buttons: ['OK']
      });

      await alert.present();

      //alert(');
      return false
    }
  }

  //Modifica in FireStone

  async updateInCollection(collection: string, nameDoc: any, data: Partial<any>): Promise<boolean> {
    try {

      this.firestore.collection(collection).doc(nameDoc).update(data);
      this.getFilteredCollection(collection)
      return true


    } catch (error) {

      return false
    }

  }

  // Eliminare documenti in FireStone
  async deleteDocuments(collection: string, conditions: Array<{ field: string, operator: string, value: any }>): Promise<boolean> {
    let query: any = this.firestore.collection(collection).ref;

    // Applica tutte le condizioni alla query
    conditions.forEach(condition => {
      query = query.where(condition.field, condition.operator, condition.value);
    });

    try {
      const querySnapshot = await query.get();
      // Elimina tutti i documenti che corrispondono alla query
      const deletePromises = querySnapshot.docs.map((doc: any) => doc.ref.delete());
      await Promise.all(deletePromises);
      this.getFilteredCollection(collection)
      return true
    } catch (error) {
      console.error('Error deleting documents:', error);
      return false
    }
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
