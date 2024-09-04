import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppService } from 'src/app/service/app-service';
import { categoryCloth, colors, filterItmClothing, seasons, style, subCategoryCloth } from 'src/app/service/interface/outfit-all-interface';

@Component({
  selector: 'app-filter-outfits',
  templateUrl: './filter-outfits.page.html',
  styleUrls: ['./filter-outfits.page.scss'],
})



export class FilterOutfitsPage implements OnInit {

  constructor(private modalController: ModalController,private appService:AppService) { }

  oufitCategories:{
    id:string;
    value:string;
    parent:string;
  }[] = [];
  oufitSubCategories:any;

  itmColor:any;
  itmStyles:any;
  itmSeasons:any;
  
  selectedFilterClothIndex:any
  selectedFilterStyleIndex:any
  selectedFilterSeasonIndex:any

  isModalOpenCat:boolean = false;
  isModalOpenColor:boolean = false;

  filterItmColor:any
  filterItmStyle:any;
  filterItmClothing:Partial<filterItmClothing[]>  = []
  filterItmSeason:any;

  async ngOnInit() {
    
    this.oufitCategories =  await this.appService.getFilteredCollection('outfitsCategories',[])
    let dataR =   await this.appService.getFilteredCollection('outfitsSubCategories',[])
    
    this.oufitSubCategories = dataR.reduce((subCategories: any, item: any) => {
      const category = item.parent;
   
      subCategories[category] = subCategories[category] ?? [];
      subCategories[category].push(item);

      return subCategories;

    }, {});

    this.filterItmClothing.push(
      {
        image:'',
        outfitCategory:'',
        outfitSubCategoryName:'Seleziona capo',
        outfitSubCategory:'',
        colorName:'Seleziona colore',
        color: '',
        style:''
        
      },
      {
        image:'',
        outfitCategory:'',
        outfitSubCategoryName:'Seleziona capo',
        outfitSubCategory:'',
        colorName:'Seleziona colore',
        color: ''
      }
  )

  this.itmColor = colors
  this.itmStyles = style
  this.itmSeasons = seasons
  }
  
  selectedSubCat(itemSub?:any){
    
    if(!itemSub){
      this.isModalOpenCat = false;
      this.selectedFilterClothIndex = undefined
      return 
    }
    this.isModalOpenCat = !this.isModalOpenCat;
    
    const index = this.selectedFilterClothIndex;

    const filterItmClothing={
      
      outfitCategory:itemSub.parent,
      outfitSubCategoryName:itemSub.value,
      outfitSubCategory:itemSub.id,
    }
    this.filterItmClothing[index] = {
      ...this.filterItmClothing[index],  // Mantiene le proprietà già esistenti
      ...filterItmClothing  // Sovrascrive solo le proprietà che stai aggiornando
     
    }
    this.selectedFilterClothIndex = undefined
  }
  
  openCategory(index:any){

    this.selectedFilterClothIndex =  index
    this.isModalOpenCat = !this.isModalOpenCat;
  }
  
  selectedColor(itemColor?:any){
    if(!itemColor){
      this.isModalOpenColor = false;
      this.selectedFilterClothIndex = undefined
      return 
    }

    this.isModalOpenColor = !this.isModalOpenColor;
    
    const index = this.selectedFilterClothIndex;
    const filterItmColor={
      colorName:itemColor.value,
      color: itemColor.id
     
   }
    this.filterItmClothing[index] = {
      ...this.filterItmClothing[index],
      ...filterItmColor
    };
    this.selectedFilterClothIndex = undefined
  }
  
  selStyle(indexStyle:any,selStyle:any){
    if(this.selectedFilterStyleIndex == indexStyle){
      this.filterItmStyle = null;
      this.selectedFilterStyleIndex = null;
      return
    }
    this.selectedFilterStyleIndex = indexStyle
    this.filterItmStyle = selStyle
  }
  selSeason(indexSeason:any,selSeason:any){
    
    if(this.selectedFilterSeasonIndex == indexSeason){
      this.filterItmSeason = null;
      this.selectedFilterSeasonIndex = null;
      return
    }
    this.selectedFilterSeasonIndex = indexSeason
    this.filterItmSeason = selSeason
  }

  openColor(i:any){
    this.selectedFilterClothIndex =  i
    this.isModalOpenColor = !this.isModalOpenColor;
  }

  delItmCloth(evt:any,i:any) {

    evt.preventDefault()
    evt.stopPropagation()

    this.filterItmClothing[i]={
      ...this.filterItmClothing[i],
      outfitCategory:'',
      outfitSubCategoryName:'Seleziona capo',
      outfitSubCategory:'',
    }
  }

  delItmColor(evt:any,i:any) {
    
    evt.preventDefault()
    evt.stopPropagation()

    this.filterItmClothing[i]={
      ...this.filterItmClothing[i],
      colorName:'Seleziona colore',
      color: ''
    }
  }
  
  closeFilter(){
    let tag: { color: string | undefined; outfitCategory: string | undefined; outfitSubCategory: string | undefined; }[] = []
    if(this.filterItmClothing){
      this.filterItmClothing.forEach(itmC=>{
        if(itmC?.color == '' &&  itmC?.outfitCategory=='' && itmC?.outfitSubCategory=='' ){
          return
        }
        tag.push({
          color:itmC?.color,
          outfitCategory:itmC?.outfitCategory,
          outfitSubCategory:itmC?.outfitSubCategory,
        });
      })
      
    }

    let createItmEl={
      color:this.filterItmColor,
      tag:tag,
      style:this.filterItmStyle,
      season:this.filterItmSeason
    }
    this.modalController.dismiss(createItmEl);
  }
  
  /*****Questo serve per la tua pigrizia***** */
  addAllCategory(){
    subCategoryCloth.forEach(subCategory=>{
      let id = `${subCategory.id}_${subCategory.value.replace(' ','')}`
      this.appService.saveInCollection('outfitsSubCategories',id,subCategory)
    })
    
  }

}
