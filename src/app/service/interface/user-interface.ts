export interface UserProfile {
  uid: string;
  displayName: string;
  cognome: string;
  name: string;
  nome?: string;
  email: string;
  password:string;
  photoURL: string;
  bio?: string;
  userType?: any;
  gender: '' | 'U' | 'D';
  createAt: number;
  editedAt?: number;

}

export type EditableUserProfile = Partial<Pick<UserProfile,
  'displayName' | 'nome' | 'cognome' | 'bio' | 'photoURL' | 'gender'>>;

export interface UserPreference {
  uid: string;
  color: string[];
  brend: string[];
  style: string[];
}

export type OutfitPreferencePayload = Omit<UserPreference, 'uid'>;

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  nome: string;
  cognome: string;
  bio?: string;
  gender: 'U' | 'D';
  termsAccepted: boolean;
}

export interface TermsStatus {
  accepted: boolean;
  acceptedVersion: string | null;
  currentVersion: string;
}

export interface BlockedUser {
  id: string;
  blockedUserId: string;
  createdAt: number;
  displayName?: string;
  photoURL?: string;
}
