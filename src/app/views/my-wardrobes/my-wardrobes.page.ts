import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalController } from '@ionic/angular';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AppService } from 'src/app/service/app-service';
import { categoryCloth, Tag, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';

@Component({
  selector: 'app-my-wardrobes',
  templateUrl: './my-wardrobes.page.html',
  styleUrls: ['./my-wardrobes.page.scss'],
})
export class MyWardrobesPage  {
  [x: string]: any;
  wardrobesItems: any;
  wardrobesGrupped: any = []
  userID: string =''
  groupedItems: any = {};
  constructor(private appService: AppService, private afAuth: AngularFireAuth,private modalController:ModalController,) { }

  ngOnInit() {


    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userID = user.uid;
        this.groupItemsByCategory();
      }
    });
  }

  async groupItemsByCategory() {

    let filer =[{
      field:'userId',
      operator:'==',
      value:this.userID 
    }]
    let dataR = await this.appService.getFilteredCollection('wardrobes', filer)

    this.wardrobesGrupped = categoryCloth;
    this.wardrobesItems = dataR.reduce((group: any, item: wardrobesItem) => {
      const category = item.outfitCategory;

      let filter =  categoryCloth.filter(ress=>ress.id == category )
      
      group[category] = group[category] ?? [];
      group[category].push(item);

     /*  this.wardrobesGrupped.push({
        id:filter[0].id,
        wardrobesName:filter[0].value
      }) */

      return group;

    }, {});

    

    // Utilizza un Set per rimuovere i duplicati

   /*  this.wardrobesGrupped = this.wardrobesGrupped.filter((obj: { id: any; }, index: any, self: any[]) =>
      index === self.findIndex((o) => o.id === obj.id)
    ); */
    
  }
  objectKeys(obj: any): string[] {
    let key = Object.keys(obj);
    
    return Object.keys(obj);
  }

  async deleteItemWadro(wardrobesCategory: any, item: any) {
    let coditions = [

      {
        field: 'userId', operator: '==', value: this.userID
      },
      {
        field: 'outfitSubCategory', operator: '==', value: item.outfitSubCategory
      }
    ]
    let res = await this.appService.deleteDocuments('wardrobes', coditions)

    if (res) {
      this.wardrobesItems[wardrobesCategory] = this.wardrobesItems[wardrobesCategory].filter((i:any) => i.id !== item.id);

      // Se la categoria diventa vuota, puoi anche rimuovere la categoria dal gruppo
      /* if (this.wardrobesItems[wardrobesCategory].length === 0) {
        delete this.wardrobesItems[wardrobesCategory];
      } */
    }
  }

  async addClothModal(){
    const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'tagForm',
        title:'Inserisci un nuovo prodotto'
       
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('Modal data:', data);
    
    const categoryID = data.category;
    const subCategoryID = data.subCategory;

   
    const id = Math.floor(Math.random() * (5 - 1 + 1)) + 1;;
    let saveData:wardrobesItem = {
      brend: data.brend,
      id: id,
      images: [''],
      name: data.name,
      outfitCategory: categoryID,
      outfitSubCategory: subCategoryID,
      color:data.color,
      userId: this.userID
    }

    let resSave = await this.appService.saveInCollection('wardrobes',undefined,saveData)
    if(resSave){
      if (!this.wardrobesItems[categoryID]) {
        // Se non esiste, crea un nuovo array per quella categoria
        this.wardrobesItems[categoryID] = [];
        
        let filter =  categoryCloth.filter(ress=>ress.id == categoryID )
      
        this.wardrobesGrupped.push({
          id:filter[0].id,
          wardrobesName:filter[0].value
        })
      }
      this.wardrobesItems[categoryID].push(saveData)
    }
    return data
  }

  searchClothModal(){
    alert('nessun prodotto presente nei nostri archvi')
  }

}
