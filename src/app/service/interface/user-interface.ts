export interface UserProfile {
  uid: string;
  displayName: string;
  cognome: string;
  name: string;
  nome?: string;
  email: string;
  photoURL?: string;
  bio?: string;
  userType?: any;

}

export interface UserPreference {
  uid: string;
  color?: string[];
  brend?: string[]
  style?: string[],
}
