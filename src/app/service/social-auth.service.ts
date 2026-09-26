import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { AppleSignIn, SignInScope } from '@capawesome/capacitor-apple-sign-in';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential, UserCredential } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { FirebaseService } from './firebase.service';

export interface PendingSocialProfile {
  givenName: string;
  familyName: string;
}

interface NativeGoogleSignInResult {
  idToken: string;
  email?: string | null;
  displayName?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  imageUrl?: string | null;
}

interface LegacyGoogleSignInPlugin {
  signIn(options: { clientId: string }): Promise<NativeGoogleSignInResult>;
  signOut(options: { clientId: string }): Promise<void>;
}

const LegacyGoogleSignIn = registerPlugin<LegacyGoogleSignInPlugin>('LegacyGoogleSignIn');

@Injectable({ providedIn: 'root' })
export class SocialAuthService {
  private googleInitialized = false;
  private pendingProfile: PendingSocialProfile | null = null;

  constructor(private firebase: FirebaseService) {}

  async signInWithGoogle(): Promise<UserCredential> {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      throw new Error('GOOGLE_NATIVE_ONLY');
    }

    const clientId = this.getGoogleClientId();
    const result: NativeGoogleSignInResult = platform === 'android'
      ? await LegacyGoogleSignIn.signIn({ clientId })
      : await this.signInWithCapawesomeGoogle(clientId);

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

  async signInWithApple(): Promise<UserCredential> {
    if (Capacitor.getPlatform() !== 'ios') {
      throw new Error('APPLE_IOS_ONLY');
    }

    const rawNonce = this.generateNonce();
    const hashedNonce = await this.sha256(rawNonce);
    const result = await AppleSignIn.signIn({
      scopes: [SignInScope.Email, SignInScope.FullName],
      nonce: hashedNonce,
    });

    if (!result.idToken) {
      throw new Error('APPLE_ID_TOKEN_MISSING');
    }

    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: result.idToken,
      rawNonce,
    });
    const userCredential = await signInWithCredential(this.firebase.auth, credential);

    // Apple returns the name only on the first authorization. Preserve it
    // immediately so the existing social-registration flow can persist it.
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

  async signOutGoogle(): Promise<void> {
    this.clearPendingProfile();

    const platform = Capacitor.getPlatform();
    if (platform === 'web') return;

    const clientId = this.getGoogleClientId();
    if (platform === 'android') {
      await LegacyGoogleSignIn.signOut({ clientId });
      return;
    }

    await this.initializeGoogle(clientId);
    await GoogleSignIn.signOut();
  }

  private async signInWithCapawesomeGoogle(clientId: string): Promise<NativeGoogleSignInResult> {
    await this.initializeGoogle(clientId);
    const result = await GoogleSignIn.signIn();

    return {
      idToken: result.idToken ?? '',
      email: result.email,
      displayName: result.displayName,
      givenName: result.givenName,
      familyName: result.familyName,
      imageUrl: result.imageUrl,
    };
  }

  private getGoogleClientId(): string {
    const clientId = environment.googleAuth?.webClientId?.trim();
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID_NOT_CONFIGURED');
    }
    return clientId;
  }

  private async initializeGoogle(clientId: string): Promise<void> {
    if (this.googleInitialized) return;

    await GoogleSignIn.initialize({ clientId });
    this.googleInitialized = true;
  }

  private generateNonce(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  private async sha256(value: string): Promise<string> {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
