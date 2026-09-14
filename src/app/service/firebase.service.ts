import { Injectable } from '@angular/core';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { FirebaseStorage, connectStorageEmulator, getStorage } from 'firebase/storage';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

let emulatorsConnected = false;

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  readonly app: FirebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase);
  readonly auth: Auth = getAuth(this.app);
  readonly storage: FirebaseStorage = getStorage(this.app);
  readonly authState = new Observable<User | null>((subscriber) =>
    onAuthStateChanged(this.auth, subscriber),
  );

  constructor() {
    if (environment.useEmulators && !emulatorsConnected) {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectStorageEmulator(this.storage, '127.0.0.1', 9199);
      emulatorsConnected = true;
    }
  }

  async waitForAuthState(): Promise<User | null> {
    await this.auth.authStateReady();
    return this.auth.currentUser;
  }
}
