import { effect, Injectable, signal } from '@angular/core';
import { firstValueFrom, forkJoin, lastValueFrom, Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap } from 'rxjs/operators';
import { EditableUserProfile, FollowStatus, OutfitPreferencePayload, TermsAcceptanceResult, TermsStatus, UserBootstrap, UserPreference, UserProfile } from './interface/user-interface';
import { ApiRequestError, ApiResponse, AppService } from './app-service';
import { signOut } from 'firebase/auth';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FavoriteOutfit, FavoriteRelation } from './interface/outfit-all-interface';
import { FirebaseService } from './firebase.service';
import { PushNotificationService } from './push-notification.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiFire = environment.BASE_API_URL;
  // Crea un Signal per il wardrobe
  faveUserOutfitsSignal =  signal<any[]>([]); // Stato reattivo
  numberFaveUserOutfitsSignal =  signal<number>(0); // Stato reattivo
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
  _userPreference = signal<UserPreference | null>(null);
  _termsStatus = signal<TermsStatus | null>(null);
  private _bootstrapUid: string | null = null;

  constructor(
    private firebase: FirebaseService,
    private appService: AppService,
    private httpClient: HttpClient,
    private pushNotificationService: PushNotificationService,
  ) {

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
    const user = await this.firebase.waitForAuthState();
    if (!user) return false;

    try {
      await user.getIdToken();
      if (!this.isBootstrapReady(user.uid)) {
        await this.loadBootstrap();
      }
      return true;
    } catch (err) {
      console.error('Error loading user profile', err);
      return false;
    }
  }

  gUserProfile() {
    return this._userInfo;
  }

  gUserPreference() {
    return this._userPreference;
  }

  gTermsStatus() {
    return this._termsStatus;
  }

  isBootstrapReady(uid: string): boolean {
    return this._bootstrapUid === uid && this._userInfo()?.uid === uid;
  }

  async loadBootstrap(): Promise<UserBootstrap> {
    const response = await firstValueFrom(
      this.httpClient.get<ApiResponse<UserBootstrap>>(this.apiFire + '/user/bootstrap').pipe(
        catchError(this.handleError)
      )
    );
    this.setUserInfo(response.data.profile);
    this._userPreference.set(response.data.preferences);
    this._termsStatus.set(response.data.terms);
    this._bootstrapUid = response.data.profile.uid;
    return response.data;
  }

  registerUser<T>(api: string, payloadData: T): Observable<T> {
    const completeApi = `${this.apiFire}${api}`;
    return this.httpClient.post<ApiResponse<T>>(completeApi, payloadData).pipe(
      map((response) => response.data),
      catchError(this.handleError)
    );
  }
  getTermsStatus(): Observable<TermsStatus> {
    return this.httpClient.get<ApiResponse<TermsStatus>>(this.apiFire + '/user/terms-status').pipe(
      map(response => response.data),
      tap(status => this._termsStatus.set(status)),
      catchError(this.handleError)
    );
  }
  acceptTerms(): Observable<TermsAcceptanceResult> {
    return this.httpClient.post<ApiResponse<TermsAcceptanceResult>>(this.apiFire + '/user/accept-terms', { accepted: true }).pipe(
      map(response => response.data),
      tap(result => this._termsStatus.set({
        accepted: true,
        acceptedVersion: result.termsVersion,
        currentVersion: result.termsVersion
      })),
      catchError(this.handleError)
    );
  }
  loginUser<T>(api: string, payloadData: T): Observable<T> {
    const completeApi = `${this.apiFire}${api}`;
    return this.httpClient.post<ApiResponse<T>>(completeApi, payloadData).pipe(
      map((response) => response.data),
      catchError(this.handleError)
    );
  }

  getUserProfile(userId?: any): Observable<UserProfile> {

  const apiSubject = `${this.apiFire}/user/user-profile/${userId}`;

    return this.httpClient.get<ApiResponse<UserProfile>>(apiSubject).pipe(
      retry(3),
      map(response => response.data),
      tap((profile) => this._userInfo.set(profile)),

      catchError(this.handleError)
    );
  }

  getFollowStatus(uid: string): Observable<FollowStatus> {
    return this.httpClient.get<ApiResponse<FollowStatus>>(`${this.apiFire}/gen/user-follows/${encodeURIComponent(uid)}/status`).pipe(map(response => response.data), catchError(this.handleError));
  }

  followUser(uid: string): Observable<void> {
    return this.httpClient.post<ApiResponse<unknown>>(`${this.apiFire}/gen/user-follows/${encodeURIComponent(uid)}`, {}).pipe(map(() => undefined), catchError(this.handleError));
  }

  unfollowUser(uid: string): Observable<void> {
    return this.httpClient.delete<ApiResponse<unknown>>(`${this.apiFire}/gen/user-follows/${encodeURIComponent(uid)}`).pipe(map(() => undefined), catchError(this.handleError));
  }

  updateUserProfile(uid: string, profileData: EditableUserProfile): Observable<UserProfile> {
    const completeApi = `${this.apiFire}/user/update-user-profile/${uid}`;
    const allowed: Array<keyof EditableUserProfile> = ['displayName', 'nome', 'cognome', 'bio', 'photoURL', 'gender'];
    const payload = allowed.reduce((result, field) => {
      if (Object.prototype.hasOwnProperty.call(profileData, field) && profileData[field] !== undefined) (result as any)[field] = profileData[field];
      return result;
    }, {} as EditableUserProfile);
    return this.httpClient.put<ApiResponse<UserProfile>>(completeApi, payload).pipe(
      map((response) => response.data),
      catchError(this.handleError),
      tap((resp:any) => this.setUserInfo(resp)) // Aggiorna la l'utente dopo la modifica
    );
  
  }

  async updateProfilePicture(imageData: string): Promise<void> {
    const user = await this.firebase.waitForAuthState();
    if (user) {
      const filePath = `profile_pictures/${user.uid}.jpg`;
      const storageRef = ref(this.firebase.storage, filePath);
      await uploadString(storageRef, imageData, 'data_url');
      const photoURL = await getDownloadURL(storageRef);

      await lastValueFrom(this.updateUserProfile(user.uid, { photoURL }));
    }
  }
  /**FINE GESTIONE DATI UTENTE**/
  async setUserPreference(profilePreferData: Partial<UserPreference>): Promise<boolean> {
    try {
      const payload = {
        color: profilePreferData.color ?? [],
        brend: profilePreferData.brend ?? [],
        style: profilePreferData.style ?? []
      };
      const response = await lastValueFrom(this.httpClient.put<ApiResponse<UserPreference>>(this.apiFire + '/gen/user-preferences', payload));
      this._userPreference.set(response.data);
      return true;
    } catch (error) {

      return false
    }

  }

  // Funzione per controllare se l'utente è loggato e caricare i dettagli
  async isUserLoggin(): Promise<boolean> {
    
    const user = await this.firebase.waitForAuthState();

    if (user) {
      const token = await user.getIdToken();
      if (token) {
        return true;
      }
    }

    return false;
  }

  

  getUserOutfits(): Observable<any[]> {
    return this.appService.getUserOutfits();
  }

  getUserWardrobes(): Observable<any[]> {
    return this.appService.getWardrobes();
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
  loadFaveUserOutfits(): Observable<FavoriteOutfit[]> {
    const apiSubject = `${this.apiFire}/gen/faveUserOutfits`;
    return this.httpClient.get<ApiResponse<FavoriteRelation[]>>(apiSubject).pipe(
      retry(3),
      map(response => response.data),
      switchMap(relations => relations.length
        ? forkJoin(relations.map(favorite => this.appService.getOutfit(favorite.outfitId)
          .then(outfit => ({ ...outfit, outfitId: favorite.outfitId, favoriteId: favorite.id }))
          .catch(error => error instanceof ApiRequestError && error.status === 404 ? null : Promise.reject(error))))
        : of([] as FavoriteOutfit[])),
      map(favorites => favorites.filter((favorite): favorite is FavoriteOutfit => favorite !== null)),
      tap((data) => this.setFaveUserOutfits(data)), // Aggiorna la lista dopo la cancellazione),
      catchError(this.handleError)
    );
  }

  delFaveUserOutfits(outfitId: string): Observable<FavoriteOutfit[]> {
    const completeApi = `${this.apiFire}/gen/faveUserOutfits/${encodeURIComponent(outfitId)}`;
    return this.httpClient.delete(completeApi).pipe(
      switchMap(() => this.loadFaveUserOutfits()),
      catchError(this.handleError)
    );
  }
  saveFaveUserOutfits(outfitId: string): Observable<FavoriteOutfit[]> {
    const completeApi = `${this.apiFire}/gen/faveUserOutfits`;
    return this.httpClient.post<ApiResponse<FavoriteRelation>>(completeApi, { outfitId }).pipe(
      switchMap(() => this.loadFaveUserOutfits()),
      catchError(this.handleError),
    );
  }


  async getUserPreference(): Promise<UserPreference | null> {
    try {
      const user = await this.firebase.waitForAuthState();
      if (user) {
        const response = await firstValueFrom(this.httpClient.get<ApiResponse<UserPreference | UserPreference[] | null>>(`${this.apiFire}/gen/user-preferences`));
        const preference = Array.isArray(response.data) ? response.data[0] : response.data;
        const normalizedPreference = preference ? {
          uid: preference.uid ?? '',
          ...this.toOutfitPreferencePayload(preference)
        } : null;
        this._userPreference.set(normalizedPreference);
        return normalizedPreference;
      }
    } catch (error) {
      console.error('Errore durante il recupero delle preferenze utente:', error);
    }
    return null; // Ritorna null se non c'è un utente o si verifica un errore

  }

  toOutfitPreferencePayload(preference?: Partial<UserPreference> | null): OutfitPreferencePayload {
    return {
      color: Array.isArray(preference?.color) ? preference.color : [],
      brend: Array.isArray(preference?.brend) ? preference.brend : [],
      style: Array.isArray(preference?.style) ? preference.style : [],
    };
  }

  async logOut(): Promise<boolean> {
    try {
      await Promise.race([
        this.pushNotificationService.disableCurrentDevice(),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
      await signOut(this.firebase.auth);
      this._userInfo.set(null);
      this._userPreference.set(null);
      this._termsStatus.set(null);
      this._bootstrapUid = null;
      console.log('Logout effettuato con successo');
      return true; // Logout completato con successo
    } catch (error) {
      console.error('Errore durante il logout:', error);
      return false; // Errore durante il logout
    }
  }

  async deleteAccount(): Promise<boolean> {
    const user = await this.firebase.waitForAuthState();
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
    const api = `${this.apiFire}/user/disable/${uid}`


    try {
      let call = this.httpClient.post(api, {})
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

    return throwError(() => new ApiRequestError(userFriendlyMessage, error.status, error.error?.code, error.error?.categories));
  }
}
