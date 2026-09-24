import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { GoogleAuthProvider, signInWithCredential, UserCredential } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { FirebaseService } from './firebase.service';

export interface PendingSocialProfile {
  givenName: string;
  familyName: string;
}

@Injectable({ providedIn: 'root' })
export class SocialAuthService {
  private googleInitialized = false;
  private pendingProfile: PendingSocialProfile | null = null;

  constructor(private firebase: FirebaseService) {}

  async signInWithGoogle(): Promise<UserCredential> {
    if (Capacitor.getPlatform() === 'web') {
      throw new Error('GOOGLE_NATIVE_ONLY');
    }

    await this.initializeGoogle();
    const result = await GoogleSignIn.signIn();
    if (!result.idToken) {
      throw new Error('GOOGLE_ID_TOKEN_MISSING');
    }

    const credential = GoogleAuthProvider.credential(result.idToken);
    const userCredential = await signInWithCredential(this.firebase.auth, credential);
    this.pendingProfile = {
      givenName: result.givenName?.trim() || '',
      familyName: result.familyName?.trim() || '',
    };
    return userCredential;
  }

  getPendingProfile(): PendingSocialProfile | null {
    return this.pendingProfile;
  }

  clearPendingProfile(): void {
    this.pendingProfile = null;
  }

  private async initializeGoogle(): Promise<void> {
    if (this.googleInitialized) return;

    const clientId = environment.googleAuth?.webClientId?.trim();
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID_NOT_CONFIGURED');
    }

    await GoogleSignIn.initialize({ clientId });
    this.googleInitialized = true;
  }
}
