

export interface Tag {
    id:any;
    name: string;
    x: number;
    y: number;
    link?: string;
  }
  
  // Interfaccia principale per l'oggetto
export interface outfit {
    title: string;
    description?: string;
    imageUrl: string;
    tags: Tag[];
    gender: 'man' | 'woman'; // Assumendo che i valori possibili siano solo "man" o "woman"
    style: 'casual' | 'elegant' | 'sporty' | 'formal'; // Assumendo alcuni stili possibili
    season: 'winter' | 'spring' | 'summer' | 'autumn'; // Assumendo alcune stagioni possibili
    color?:string;
    userId:any
  }

