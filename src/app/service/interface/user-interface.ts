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
  gender: string;
  createAt: number;
  editedAt?: number;

}

export interface UserPreference {
  uid: string;
  color?: string[];
  brend?: string[];
  style?: string[];
  uIdBlocked?:string[];
}

