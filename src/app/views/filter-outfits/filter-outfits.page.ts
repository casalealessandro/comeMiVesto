import { Component, Input, OnInit } from '@angular/core';
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

  @Input() currentFilterSel: any

  oufitCategories:{
    id:string;
    value:string;
    parent:string;
  }[] = [];
  oufitSubCategories:any;
  simpleOufitSubCategories:any;

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
    this.simpleOufitSubCategories = dataR
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
    this.itmSeasons = seasons;

    console.log(this.currentFilterSel);
    if(typeof this.currentFilterSel.season != 'undefined'){
      this.selectedFilterSeasonIndex =  this.itmSeasons.findIndex((r:any)=>r.id == this.currentFilterSel.season)
    }
    
    if(typeof this.currentFilterSel.style != 'undefined'){
      this.selectedFilterStyleIndex =  this.itmStyles.findIndex((r:any)=>r.id == this.currentFilterSel.style)
    }

    if(typeof this.currentFilterSel.outfitCategory != 'undefined' && this.currentFilterSel.outfitCategory.length>0){
      console.log(this.currentFilterSel.tags);
      const filterOutfitCategory =  this.currentFilterSel.outfitCategory
      const outfitCategory = this.oufitCategories.filter(category=>filterOutfitCategory.includes(category.id)) 
      
      outfitCategory.forEach((res,i)=>{
        this.filterItmClothing[i]={
          ...this.filterItmClothing[i],
          outfitCategory:res.id
        }
      })
    }

    if(typeof this.currentFilterSel.outfitSubCategory != 'undefined' ){
      const filterOutfitSubCategory = this.currentFilterSel.outfitSubCategory
      const outfitSubCategory = this.simpleOufitSubCategories.filter((subCategory:any)=>filterOutfitSubCategory.includes(subCategory.id)) 
      console.log(outfitSubCategory)
      outfitSubCategory.forEach((res: any,i:any)=>{
        this.filterItmClothing[i]={
          ...this.filterItmClothing[i],  
          outfitSubCategory:res.id,
          outfitSubCategoryName:res.value,
        }
      })
    }
    if(this.currentFilterSel.color != 'undefined' ){
      const colors = this.currentFilterSel.color
      const outfitColor = this.itmColor.filter((color:any)=>colors.includes(color.id)) 
      console.log(outfitColor)
      outfitColor.forEach((res: any,i:any)=>{
        this.filterItmClothing[i]={
          ...this.filterItmClothing[i],  
          color:res.id,
          colorName:res.value,
        }
      })
    }
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
   let tags 
    if(this.filterItmClothing){
      tags = this.filterItmClothing.reduce(
        (acc: { outfitCategory: string[], outfitSubCategory: string[], color: string[] }, tag) => {
          if (tag) {
            if (tag.outfitCategory && !acc.outfitCategory.includes(tag.outfitCategory)) {
              acc.outfitCategory.push(tag.outfitCategory);
            }
            if (tag.outfitSubCategory && !acc.outfitSubCategory.includes(tag.outfitSubCategory)) {
              acc.outfitSubCategory.push(tag.outfitSubCategory);
            }
            if (tag.color && !acc.color.includes(tag.color)) {
              acc.color.push(tag.color);
            }
          }
          return acc;
        },
        { outfitCategory: [], outfitSubCategory: [], color: [] }
      );
      
      
    }
    const season =  !this.filterItmSeason ? '' : this.filterItmSeason.id
    const style =  !this.filterItmStyle ? '' : this.filterItmStyle.id

    let createItmEl={
      color:'',
      
      style:style,
      season:season,
      ...tags
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
