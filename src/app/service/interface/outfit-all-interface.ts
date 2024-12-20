

export interface Tag {
  id: any;
  name: string;
  x: number;
  y: number;
  link?: string;
  color: string;
  brend?: string;
  outfitCategory: string;
  outfitSubCategory?: string;
  prezzo?: number;
  price?: number;
  images?: string[]
  imageUrl?: string
}[]

// Interfaccia principale per l'oggetto
export interface outfit {
  id: any;
  title: string;
  description?: string;
  imageUrl: string;
  tags: Tag[];
  gender: '' | 'man' | 'woman'; // Assumendo che i valori possibili siano solo "man" o "woman"
  style: '' | 'casual' | 'elegant' | 'sporty' | 'formal'; // Assumendo alcuni stili possibili
  season: '' | 'winter' | 'spring' | 'summer' | 'autumn'; // Assumendo alcune stagioni possibili
  color?: string;
  userId: any;
  visits?: number;
  likes?: number;
  createdAt?: any;
  editedAt?: any;
  outfitCategory?: any;
  outfitSubCategory?: any;
  status: 'approvato' | 'rifiutato' | 'pending'

}

export interface wardrobesItem {
  id: number;
  userId: string;
  name: string;
  outfitCategory: string;
  outfitSubCategory: string;
  brend: string;
  color: string;
  images: string[];
  ImageUrl?: string;
  prezzo?: number;
  link: string
}

export interface categoryCloth {
  id: any,
  value: any,
  parent: any
}[]

export interface filterItmClothing {
  categories:
  {
    outfitCategory?: string;
    outfitSubCategoryName?: string;
    outfitSubCategory?: string;
    colorName?: string;
    colorHex?: string;
    color?: string;
  }[],
  season?: string,
  style?: string,
  

}
export interface buttons {
  icon: string;
  text: string;
  actionName: string;
}[]

export interface FireBaseConditions {
  field: string;
  operator: string;
  value: any
}[]

export interface FireBaseOrderBy {
  field: string;
  by: 'asc' | 'desc'
}[]
export interface outfitCategories {
  [x: string]: any;

  id: any;
  imageUrl?: string;
  categoryName: string;
  parentCategory: any;
  status: any;
  order: number;
  gender: any;
  createdAt: number;
  editedAt?: number
  subcategories?: any
}
export const colors = [
  {
    id: "N",
    value: "Nero",
    parent: null,
    hex: "#000000"
  },
  {
    id: "B",
    value: "Bianco",
    parent: null,
    hex: "#FFFFFF"
  },
  {
    id: "G",
    value: "Grigio",
    parent: null,
    hex: "#808080"
  },
  {
    id: "Bg",
    value: "Beige",
    parent: null,
    hex: "#F5F5DC"
  },
  {
    id: "BN",
    value: "Blu navy",
    parent: null,
    hex: "#000080"
  },
  {
    id: "R",
    value: "Rosso",
    parent: null,
    hex: "#FF0000"
  },
  {
    id: "VO",
    value: "Verde oliva",
    parent: null,
    hex: "#808000"
  },
  {
    id: "GS",
    value: "Giallo senape",
    parent: null,
    hex: "#FFDB58"
  },
  {
    id: "RP",
    value: "Rosa pallido",
    parent: null,
    hex: "#FFD1DC"
  },
  {
    id: "A",
    value: "Azzurro",
    parent: null,
    hex: "#ADD8E6"
  },
  {
    id: "M",
    value: "Marrone",
    parent: null,
    hex: "#964B00"
  },
  {
    id: "O",
    value: "Arancione",
    parent: null,
    hex: "#FFA500"
  }
]


export const style = [
  {
    "id": "C",
    "value": "Casual",
    "parent": null
  },
  {
    "id": "B",
    "value": "Business",
    "parent": null
  },
  {
    "id": "SP",
    "value": "Sportivo",
    "parent": null
  },
  {
    "id": "SC",
    "value": "Smart Casual",
    "parent": null
  },
  {
    "id": "E",
    "value": "Elegante",
    "parent": null
  },
  {
    "id": "AT",
    "value": "Alternativo",
    "parent": null
  },
  {
    "id": "FES",
    "value": "Festival",
    "parent": null
  },
  {
    "id": "CL",
    "value": "Classico",
    "parent": null
  },
  {
    "id": "TR",
    "value": "Trendy",
    "parent": null
  },
  {
    "id": "SE",
    "value": "Serata",
    "parent": null
  }
]

export const brend = [
  {
    "id": "A",
    "value": "Armani",
    "parent": null
  },
  {
    "id": "B",
    "value": "Balenciaga",
    "parent": null
  },
  {
    "id": "BV",
    "value": "Bottega Veneta",
    "parent": null
  },
  {
    "id": "CH",
    "value": "Chanel",
    "parent": null
  },
  {
    "id": "DS",
    "value": "Dolce & Gabbana",
    "parent": null
  },
  {
    "id": "D",
    "value": "Dior",
    "parent": null
  },
  {
    "id": "F",
    "value": "Fendi",
    "parent": null
  },
  {
    "id": "G",
    "value": "Gucci",
    "parent": null
  },
  {
    "id": "H&M",
    "value": "H&M",
    "parent": null
  },
  {
    "id": "L",
    "value": "Louis Vuitton",
    "parent": null
  },
  {
    "id": "MK",
    "value": "Michael Kors",
    "parent": null
  },
  {
    "id": "M",
    "value": "Moncler",
    "parent": null
  },
  {
    "id": "P",
    "value": "Prada",
    "parent": null
  },
  {
    "id": "R",
    "value": "Ralph Lauren",
    "parent": null
  },
  {
    "id": "T",
    "value": "Tommy Hilfiger",
    "parent": null
  },
  {
    "id": "V",
    "value": "Versace",
    "parent": null
  },
  {
    "id": "Z",
    "value": "Zara",
    "parent": null
  }
]

export const categoryCloth = [
  {
    id: "M",
    value: "Maglieria",
    parent: null
  },
  {
    id: "P",
    value: "Pantaloni",
    parent: null
  },
  {
    id: "G",
    value: "Giubbotti",
    parent: null
  },
  {
    id: "S",
    value: "Scarpe",
    parent: null
  },
  {
    id: "A",
    value: "Accessori",
    parent: null
  },
  {
    id: "AI",
    value: "Abbigliamento intimo",
    parent: null
  },
  {
    id: "ABC",
    value: "Completi",
    parent: null
  },
  {
    value: "Giacche",
    id: "G"
  }
]

export const subCategoryCloth = [
  {
    id: "TS",
    value: "T-shirt",
    parent: "M"
  },
  {
    id: "PO",
    value: "Polo",
    parent: "M"
  },
  {
    id: "CM",
    value: "Camicie",
    parent: "M"
  },
  {
    id: "FL",
    value: "Felpa",
    parent: "M"
  },
  {
    id: "SNK",
    value: "Sneakers",
    parent: "S"
  },
  {
    id: "BST",
    value: "Stivali",
    parent: "S"
  },
  {
    id: "SD",
    value: "Sandali",
    parent: "S"
  },
  {
    id: "MR",
    value: "Mocassini",
    parent: "S"
  },
  {
    id: "DRS",
    value: "Scarpe Eleganti",
    parent: "S"
  },
  {
    id: "BT",
    value: "Scarponcini",
    parent: "S"
  },
  {
    id: "JE",
    value: "Jeans",
    parent: "P"
  },
  {
    id: "CH",
    value: "Chino",
    parent: "P"
  },
  {
    id: "TR",
    value: "Tuta",
    parent: "P"
  },
  {
    id: "SRT",
    value: "Shorts",
    parent: "P"
  },
  {
    id: "CRG",
    value: "Cargo",
    parent: "P"
  },
  {
    id: "CL",
    value: "Classici",
    parent: "P"
  },
  {
    id: "GTP",
    value: "Giubbotti in Pelle",
    parent: "G"
  },
  {
    id: "GTS",
    value: "Giubbotti in Stoffa",
    parent: "G"
  },
  {
    id: "GTR",
    value: "Giubbotti in Tessuto Tecnico",
    parent: "G"
  },
  {
    id: "PRA",
    value: "Parka",
    parent: "G"
  },
  {
    id: "CAP",
    value: "Cappelli",
    parent: "A"
  },
  {
    id: "GLV",
    value: "Guanti",
    parent: "A"
  },
  {
    id: "SCF",
    value: "Sciarpe",
    parent: "A"
  },
  {
    id: "BLT",
    value: "Cinture",
    parent: "A"
  },
  {
    id: "WLT",
    value: "Portafogli",
    parent: "A"
  },
  {
    id: "BAG",
    value: "Borse",
    parent: "A"
  },
  {
    id: "TIE",
    value: "Cravatte",
    parent: "A"
  },
  {
    id: "SHK",
    value: "Fazzoletti da taschino",
    parent: "A"
  },
  {
    id: "CDC",
    value: "Completo da cerimonia",
    parent: "ABC"
  },
  {
    id: "CS",
    value: "Completo sposo",
    parent: "ABC"
  },
  {
    id: "SMK",
    value: "Smoking",
    parent: "ABC"
  },
  {
    id: "MG",
    value: "Maglioncini",
    parent: "M"
  },
  {
    id: "GAE",
    value: "Gicche eleganti",
    parent: "G"
  },
  {
    id: "GAV",
    value: "Giacche a vento",
    parent: "G"
  }
]

export const seasons = [
  {
    id: "E",
    value: "Estate",
    parent: null
  },
  {
    id: "P",
    value: "Primavera",
    parent: null
  },
  {
    id: "A",
    value: "Autunno",
    parent: null
  },
  {
    id: "I",
    value: "Inverno",
    parent: null
  }
]