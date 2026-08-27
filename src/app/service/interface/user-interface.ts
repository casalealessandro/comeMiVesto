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
  uIdBlocked: string[];
}

export type OutfitPreferencePayload = Omit<UserPreference, 'uid'>;
