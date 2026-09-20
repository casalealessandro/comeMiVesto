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

export interface PublicUserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio?: string;
}

export interface FollowStatus {
  following: boolean;
}

export type EditableUserProfile = Partial<Pick<UserProfile,
  'displayName' | 'nome' | 'cognome' | 'bio' | 'photoURL' | 'gender'>>;

export type AgeRange = 'under_18' | '18_24' | '25_34' | '35_44' | '45_54' | '55_64' | '65_plus';

export interface UserPreference {
  uid: string;
  color: string[];
  brend: string[];
  style: string[];
  age?: number | null;
  ageRange?: AgeRange | null;
}

export interface UserBootstrap {
  profile: UserProfile;
  terms: TermsStatus;
  preferences: UserPreference | null;
  preferencesConfigured: boolean;
}

export type OutfitPreferencePayload = Pick<UserPreference, 'color' | 'brend' | 'style'>;

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

export interface TermsAcceptanceResult {
  termsVersion: string;
  termsAcceptedAt: number;
}

export interface BlockedUser {
  id: string;
  blockedUserId: string;
  createdAt: number;
  displayName?: string;
  photoURL?: string;
}
