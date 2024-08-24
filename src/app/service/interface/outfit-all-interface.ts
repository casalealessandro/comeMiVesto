

export interface Tag {
  id: any;
  name: string;
  x: number;
  y: number;
  link?: string;
  color?: string;
  brend?: string;
  outfitCategory: string;
  outfitSubCategory?: string;
}

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
  userId: any
}

export interface wardrobesItem {
  id: number;
  userId: string;
  name: string;
  outfitCategory: string;
  outfitSubCategory: string;
  brend: string;
  color:string;
  images: string[];
}

export interface buttons {
  icon: string;
  text: string;
  actionName: string;
}[]

export const colors = [
  {
    "id": "N",
    "value": "Nero",
    "parent": null
  },
  {
    "id": "B",
    "value": "Bianco",
    "parent": null
  },
  {
    "id": "G",
    "value": "Grigio",
    "parent": null
  },
  {
    "id": "Bg",
    "value": "Beige",
    "parent": null
  },
  {
    "id": "BN",
    "value": "Blu navy",
    "parent": null
  },
  {
    "id": "R",
    "value": "Rosso",
    "parent": null
  },
  {
    "id": "VO",
    "value": "Verde oliva",
    "parent": null
  },
  {
    "id": "GS",
    "value": "Giallo senape",
    "parent": null
  },
  {
    "id": "RP",
    "value": "Rosa pallido",
    "parent": null
  },
  {
    "id": "A",
    "value": "Azzurro",
    "parent": null
  },
  {
    "id": "M",
    "value": "Marrone",
    "parent": null
  },
  {
    "id": "O",
    "value": "Arancione",
    "parent": null
  }
]

export const style=[
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

export const brend=[
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
}]

export const subCategoryCloth= [
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
  }
]