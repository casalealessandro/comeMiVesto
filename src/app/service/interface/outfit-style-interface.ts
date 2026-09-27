export type OutfitStyleGender = 'U' | 'D';

export interface OutfitStyleImage {
  imageBase64: string;
  imageMimeType: string;
  imageFileName: string;
}

export interface OutfitStyle {
  id: string;
  value: string;
  parent: null;
  order: number;
  gender: OutfitStyleGender[];
  images: Partial<Record<OutfitStyleGender, OutfitStyleImage>>;
}
