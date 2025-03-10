import { effect, inject, Injectable, signal } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, lastValueFrom, Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap } from 'rxjs/operators';
import { UserPreference, UserProfile } from './interface/user-interface';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ApiResponse, AppService } from './app-service';
import { deleteUser } from 'firebase/auth';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiFire = "https://us-central1-comemivesto-5e5f9.cloudfunctions.net/api";
  // Crea un Signal per il wardrobe
  faveUserOutfitsSignal =  signal<any[]>([]); // Stato reattivo
  numberFaveUserOutfitsSignal =  signal<number>(0); // Stato reattivo
  angularFireAuth = inject(AngularFireAuth);

  //private _userInfo?: UserProfile | null; // Variabile privata per memorizzare il valore
  // Utilizzo di signal per mantenere lo stato reattivo
  _userInfo = signal<UserProfile | null>({
    uid: '',
    displayName: '',
    cognome: '',
    name: '',
    email: '',
    password: '',
    photoURL: '',
    gender: '',
    createAt: 0
  }); // Signal che tiene traccia del profilo utente

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth, private storage: AngularFireStorage, private appService: AppService, private httpClient: HttpClient) { 

    // Effetto per ascoltare i cambiamenti
    effect(() => {
      console.log('Outfit preferiti aggiornati:', this.faveUserOutfitsSignal());
      console.log('Profilo aggiornat:', this._userInfo());
      console.log('N.Outfit preferiti aggiornati:', this.numberFaveUserOutfitsSignal());
    });
   // this.loadUser()
  }

  /**INIZIO DELLA GESTIONE DATI UTENTE E PROFILO**/
  setUserInfo(userInfo: UserProfile)
  {
    this._userInfo.set({ ...userInfo }); // Imposta il profilo dell'utente nel signal
  }
  
  // Metodo per caricare le informazioni dell'utente
  async loadUser(): Promise<boolean> {
    const user = await this.angularFireAuth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    
    // Rendi questa operazione asincrona con una Promise
    return new Promise<boolean>((resolve, reject) => {
      this.getUserProfile(user.uid).subscribe({
        next: (profile) => {
          
          resolve(true);  // Risolvi con true quando l'operazione è completata
        },
        error: (err) => {
          console.error('Error loading user profile', err);
          resolve(false);  // Risolvi con false se c'è un errore
        }
      });
    });
  }
    return false;  // Ritorna false se l'utente non è trovato
  }
  gUserProfile() {
    return this._userInfo;
  }

  registerUser<T>(api: string, payloadData: T): Observable<T[]> {
    const completeApi = `${this.apiFire}${api}`;
    return this.httpClient.post<ApiResponse<T>>(completeApi, payloadData).pipe(
      retry(2), // Riprova in caso di errore temporaneo
      map((response) => response.data),
      catchError(this.handleError)
    );
  }
  loginUser<T>(api: string, payloadData: T): Observable<T[]> {
    const completeApi = `${this.apiFire}${api}`;
    return this.httpClient.post<ApiResponse<T>>(completeApi, payloadData).pipe(
      retry(2), // Riprova in caso di errore temporaneo
      map((response) => response.data),
      catchError(this.handleError)
    );
  }

  getUserProfile(userId?: any): Observable<UserProfile> {

  const apiSubject = `${this.apiFire}/user/user-profile/${userId}`;

    return this.httpClient.get<UserProfile>(apiSubject).pipe(
      retry(3),
      tap((res) => this._userInfo.set(res)),
      map((response: any) => response),

      catchError(this.handleError)
    );
  }

  updateUserProfile(profileData: Partial<UserProfile>): Observable<any> {
    
    const uid = profileData.uid 

    const completeApi = `${this.apiFire}/user/update-user-profile/${uid}`;

    return this.httpClient.put<ApiResponse<any>>(completeApi, profileData).pipe(
      retry(2), // Riprova in caso di errore temporaneo
      map((response) => response.data),
      catchError(this.handleError),
      tap((resp:any) => this.setUserInfo(resp)) // Aggiorna la l'utente dopo la modifica
    );
  
  }

  async updateProfilePicture(imageData: string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const filePath = `profile_pictures/${user.uid}.jpg`;
      const ref = this.storage.ref(filePath);
      await ref.putString(imageData, 'data_url');

      let photoURL = await lastValueFrom(ref.getDownloadURL())

      this.updateUserProfile({ photoURL });
    }
  }
  /**FINE GESTIONE DATI UTENTE**/
  async setUserPreference(profilePreferData: Partial<UserPreference>): Promise<boolean> {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        this.firestore.collection('usersPreference').doc(user.uid).set(profilePreferData);
        this.getUserPreference()
        return true
      }
      return false
    } catch (error) {

      return false
    }

  }

  // Funzione per controllare se l'utente è loggato e caricare i dettagli
  async isUserLoggin(): Promise<boolean> {
    
    const user = await firstValueFrom(this.afAuth.authState);

    if (user) {
      const token = await user.getIdToken();
      if (token) {
        return true;
      }
    }

    return false;
  }

  

  getUserOutfits(): Observable<any[]> {

    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('outfits', ref => ref.where('userId', '==', user.uid)).valueChanges();
        } else {
          return of([]);
        }
      })
    );
  }

  getUserWardrobes(): Observable<any[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('wardrobes', ref => ref.where('userId', '==', user.uid)).valueChanges();
        } else {
          return of([]);
        }
      })
    );
  }

  /**GESTIONE OUTFIT PREFERITI**/
  setFaveUserOutfits(faveOutfit: any)
  {
    this.faveUserOutfitsSignal.set(faveOutfit); // Imposta gli outfit preferiti nel signal

    this.numberFaveUserOutfitsSignal.set(faveOutfit.length); //
  }
  getFaveUserOutfits() {
    return this.faveUserOutfitsSignal;
  }
  getNumberFaveUserOutfitsNumber() {
    return this.numberFaveUserOutfitsSignal;
  }
  loadFaveUserOutfits(uid: any): Observable<any[]> {

    const apiSubject = `${this.apiFire}/gen/fave-user-outfits/${uid}`;

    return this.httpClient.get<ApiResponse<any[]>>(apiSubject).pipe(
      retry(3),
      
      map((response: any) => response.data),
      tap((data) => this.setFaveUserOutfits(data)), // Aggiorna la lista dopo la cancellazione),
      catchError(this.handleError)
    );
  }

  delFaveUserOutfits(uid: any, outfitId: any): Observable<any[]> {
    const completeApi = `${this.apiFire}/gen/del-fave-user-outfits?uid=${uid}&outfitId=${outfitId}`;

    return this.httpClient.delete<ApiResponse<any>>(completeApi).pipe(
      retry(2),
      map((response) => response.data),
      tap((data) => this.setFaveUserOutfits(data)), // Aggiorna la lista dopo la cancellazione
      catchError(this.handleError),
      
    );
  }
  saveFaveUserOutfits(payloadData: any): Observable<any[]> {
    
    const completeApi = `${this.apiFire}/gen/save-fave-user-outfits`;

    return this.httpClient.post<ApiResponse<any>>(completeApi, payloadData).pipe(
      retry(2), // Riprova in caso di errore temporaneo
      map((response) => response.data),
      catchError(this.handleError),
      tap((data) => this.setFaveUserOutfits(data)) // Aggiorna la lista dopo il salvataggio
    );
  }


  async getUserPreference(): Promise<UserPreference | null> {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const queryString = `uid=${user.uid}`;
        const result$ = this.appService.getAll<UserPreference>('user-preferences', queryString);

        // Utilizza firstValueFrom per convertire l'Observable in una Promise
        const result = await firstValueFrom(result$);
        // Ritorna il primo elemento, se presente
        return result.length ? result[0] : null;
      }
    } catch (error) {
      console.error('Errore durante il recupero delle preferenze utente:', error);
    }
    return null; // Ritorna null se non c'è un utente o si verifica un errore

  }

  async logOut(): Promise<boolean> {
    try {
      await this.afAuth.signOut();
      console.log('Logout effettuato con successo');
      return true; // Logout completato con successo
    } catch (error) {
      console.error('Errore durante il logout:', error);
      return false; // Errore durante il logout
    }
  }

  async deleteAccount(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    if (user) {
      try {
        //await deleteUser(user); 
        let res = await this.disabledUsersFirebase(user.uid)
        if (res) {
          // Effettua il logout o naviga su una pagina appropriata
          await this.logOut();
          return true;
        }


      } catch (error) {

        console.error('Errore durante la cancellazione dell\'account:', error);
        return false;
      }
    }
    return false;
  }

  async disabledUsersFirebase(uid: string): Promise<boolean> {
    const api = `${this.apiFire}/users/disable/${uid}`
    let data = {
      uid: uid
    }


    try {
      let call = this.httpClient.post(api, data)
      const result = await lastValueFrom(call);
      console.log(result);
      return true;
    } catch (error) {
      console.error('Errore nella disabilitazione dell\'utente:', error);
      return false;
    }

  }

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
        case 404:
          userFriendlyMessage = 'Risorsa non trovata.';
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
}
