import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { lastValueFrom, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserPreference, UserProfile } from './interface/user-interface';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AppService } from './app-service';
import { deleteUser } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
apiFire="https://us-central1-comemivesto-5e5f9.cloudfunctions.net/api"
  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth,private storage: AngularFireStorage, private appService:AppService, private httpClient:HttpClient) {}

  getUserProfile(): Observable<UserProfile | null> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('users').doc<UserProfile>(user.uid).valueChanges().pipe(
            map(profile => profile || null) // Trasforma undefined in null
          );
        } else {
          return of(null); // Ritorna un Observable che emette null
        }
      })
    );
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<boolean> {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        this.firestore.collection('users').doc(user.uid).update(profileData);

        return true
      }
      return false
    } catch (error) {
      console.error(error)
      return false
    }
   
  }
  
  async setUserPreference(profilePreferData: Partial<UserPreference>): Promise<boolean> {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        this.firestore.collection('usersPreference').doc(user.uid).set(profilePreferData);

        return true
      }
      return false
    } catch (error) {

      return false
    }
   
  }

  async updateProfilePicture(imageData: string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const filePath = `profile_pictures/${user.uid}.jpg`;
      const ref = this.storage.ref(filePath);
      await ref.putString(imageData, 'data_url');
     
      let photoURL =  await lastValueFrom(ref.getDownloadURL())
       
      await this.updateUserProfile({ photoURL });
    }
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

  getFaveUserOutfits(): Observable<any[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('faveUserOutfits', ref => ref.where('userId', '==', user.uid)).valueChanges();
        } else {
          return of([]);
        }
      })
    );
  }

  async getUserPreference(): Promise<UserPreference[]> {
    let result:any
    const user = await this.afAuth.currentUser;
      if (user) {
        result = await this.appService.getFilteredCollection('usersPreference',[{field:'uid',operator:'==',value:user.uid}])
      }
      
    return result  
    
  }

  async logOut(): Promise<boolean>{
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
       if(res){
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
    let data={
      uid:uid
    }
     

    try {
      let call = this.httpClient.post(api,data)
      const result = await lastValueFrom(call);
      console.log(result);
      return true;
    } catch (error) {
      console.error('Errore nella disabilitazione dell\'utente:', error);
      return false;
    }
   
  }
}
