import { Component, DestroyRef, Input, OnInit, inject, signal } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppService } from 'src/app/service/app-service';
import { CategoryService } from 'src/app/service/category.service';
import { categoryCloth, filterItmClothing, outfitCategories, seasons, style, subCategoryCloth } from 'src/app/service/interface/outfit-all-interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-filter-outfits',
  templateUrl: './filter-outfits.page.html',
  styleUrls: ['./filter-outfits.page.scss'],
})



export class FilterOutfitsPage implements OnInit {
  private destroyRef = inject(DestroyRef);


  constructor(private appService: AppService, private categoryService: CategoryService, private modalController: ModalController) { }

  @Input() currentFilterSel?: Partial<filterItmClothing>;

  oufitCategories = signal<outfitCategories[]>([]);
  oufitCompleteCategories = signal<outfitCategories[]>([]);
  selectoufitCategories = signal<any>('');

  itmColor: any;
  itmStyles: any;
  itmSeasons: any;
  itmGenders: any = [
    { id: 'U', value: 'Uomo' },
    { id: 'D', value: 'Donna' },
  ]

  selectedFilterClothIndex: any
  selectedFilterStyleIndex: any = signal(null)
  selectedFilterSeasonIndex: any = signal(null)

  isModalOpenCat: boolean = false;
  isModalOpenColor: boolean = false;

  filterItmColor: any
  filterItmStyle: any;
  filterItmClothing: Partial<filterItmClothing> = {
    categories: [
      {
        outfitCategory: '',
        outfitSubCategoryName: 'Seleziona',
        outfitSubCategory: '',
        color: '',
        colorName: 'Seleziona',
        colorHex: '',
      },
      {
        outfitCategory: '',
        outfitSubCategoryName: 'Seleziona',
        outfitSubCategory: '',
        color: '',
        colorName: 'Seleziona',
        colorHex: '',
      }
    ],
    season: '',

    style: ''

  }

  filterItmSeason: any;

  async ngOnInit() {

    this.categoryService.categoriesSubject.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(parentCategories => {
      this.oufitCategories.set(parentCategories);
      this.oufitCompleteCategories.set(this.oufitCategories())
    })







    this.appService.getAllData('outfitColors').pipe(take(1)).subscribe(colors => {
      this.itmColor = colors
    })
    this.itmStyles = style
    this.itmSeasons = seasons;



    if (this.currentFilterSel && this.currentFilterSel.categories) {
      for (let x = 0; x < this.currentFilterSel.categories.length; x++) {
        if (this.filterItmClothing.categories && this.filterItmClothing.categories[x]) {
          this.filterItmClothing.categories[x] = {
            ...this.filterItmClothing.categories[x],
            ...this.currentFilterSel.categories[x]
          };
        }
      }
    }
    if (this.currentFilterSel?.season) {
      const season = this.currentFilterSel.season;
      this.selectedFilterSeasonIndex.set(this.itmSeasons.findIndex((r: any) => r.id == season))

      this.filterItmClothing.season = season
    }
    if (this.currentFilterSel?.style) {
      const selectedStyle = this.currentFilterSel.style;
      this.selectedFilterStyleIndex.set(this.itmStyles.findIndex((r: any) => r.id == selectedStyle))
      this.filterItmClothing.style = selectedStyle
    }

  }




  selectedSubCat(itemSub?: any) {
    if (!itemSub) {
      this.isModalOpenCat = false;
      this.selectedFilterClothIndex = undefined;
      return;
    }
    this.isModalOpenCat = !this.isModalOpenCat;

    const index = this.selectedFilterClothIndex;

    const filterItmClothing = {
      outfitCategory: itemSub.parent,
      outfitSubCategoryName: itemSub.categoryName,
      outfitSubCategory: itemSub.id,
    };

    if (this.filterItmClothing.categories) {
      this.filterItmClothing.categories[index] = {
        ...this.filterItmClothing.categories[index],  // Mantiene le proprietà già esistenti
        ...filterItmClothing  // Sovrascrive solo le proprietà che stai aggiornando
      };
    } else {
      // Handle the case when index is out of range or undefined
      console.error('Index is out of range or undefined');
    }

    this.selectedFilterClothIndex = undefined;
  }


  openCategory(index: any) {

    this.selectedFilterClothIndex = index
    this.isModalOpenCat = !this.isModalOpenCat;
  }


  // Funzione per filtrare le categorie per donne
  async filterCategory(category?: outfitCategories) {
    if (!category) {
      this.oufitCompleteCategories.set(this.oufitCategories())
      this.selectoufitCategories.set('')
      return
    }
    let newCategory = []
    if (category.subcategories)
      this.selectoufitCategories.set(category.id)
    newCategory.push(category)
    this.oufitCompleteCategories.set(newCategory)

  }

  selectedColor(itemColor?: any) {
    if (!itemColor) {
      this.isModalOpenColor = false;
      this.selectedFilterClothIndex = undefined
      return
    }

    this.isModalOpenColor = !this.isModalOpenColor;

    const index = this.selectedFilterClothIndex;
    const filterItmColor = {
      colorName: itemColor.value,
      color: itemColor.id,
      colorHex: itemColor.hex,

    }
    if (this.filterItmClothing.categories) {
      this.filterItmClothing.categories[index] = {
        ...this.filterItmClothing.categories[index],
        ...filterItmColor
      };
    }
    this.selectedFilterClothIndex = undefined
  }

  selStyle(indexStyle: any, selStyle: any) {
    if (this.selectedFilterStyleIndex == indexStyle) {
      this.filterItmStyle = null;
      this.selectedFilterStyleIndex.set(null);
      this.filterItmClothing.style = ''
      return
    }
    this.selectedFilterStyleIndex.set(indexStyle);
    this.filterItmStyle = selStyle
    this.filterItmClothing.style = selStyle.id
  }

  selSeason(indexSeason: any, selSeason: any) {

    if (this.selectedFilterSeasonIndex == indexSeason) {
      this.filterItmSeason = null;
      this.selectedFilterSeasonIndex.set(null);
      this.filterItmClothing.season = ''
      return
    }
    this.selectedFilterSeasonIndex.set(indexSeason);
    this.filterItmSeason = selSeason
    this.filterItmClothing.season = selSeason.id
  }

  openColor(i: any) {
    this.selectedFilterClothIndex = i
    this.isModalOpenColor = !this.isModalOpenColor;
  }

  delItmCloth(evt: any, i: any) {

    evt.preventDefault()
    evt.stopPropagation()

    if (this.filterItmClothing.categories) {
      this.filterItmClothing.categories[i] = {
        ...this.filterItmClothing.categories[i],
        outfitCategory: '',
        outfitSubCategoryName: 'Seleziona',
        outfitSubCategory: '',
      }
    }

  }

  delItmColor(evt: any, i: any) {

    evt.preventDefault()
    evt.stopPropagation()
    if (this.filterItmClothing.categories) {
      this.filterItmClothing.categories[i] = {
        ...this.filterItmClothing.categories[i],
        colorName: 'Seleziona',
        color: '',
        colorHex: ''
      }
    }

  }



  async clearAllFilters() {
    this.filterItmClothing = {
      categories: [
        {
          outfitCategory: '',
          outfitSubCategoryName: 'Seleziona',
          outfitSubCategory: '',
          color: '',
          colorName: 'Seleziona',
          colorHex: '',
        },
        {
          outfitCategory: '',
          outfitSubCategoryName: 'Seleziona',
          outfitSubCategory: '',
          color: '',
          colorName: 'Seleziona',
          colorHex: '',
        }
      ],
      season: '',

      style: ''

    }

    await this.modalController.dismiss(null, 'clear');
  }

  async saveSelecedFilter() {

    await this.modalController.dismiss(this.filterItmClothing, 'apply');
  }

}
