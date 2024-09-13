import { Component, OnInit, signal } from '@angular/core';
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
  wardrobesItems = this.appService.resultsSignal; // Utilizza signal per rendere reattivo l'array
  wardrobesGrupped: any = []
  userID: string =''
  groupedItems: any = {};
  categoryCloth:categoryCloth[] = [];
  subCategoryCloth:categoryCloth[] = [];
  
  constructor(private appService: AppService, private afAuth: AngularFireAuth,private modalController:ModalController,) { }

  ngOnInit() {


    this.afAuth.authState.subscribe(async user => {
      if (user) {
        this.userID = user.uid;
        
        this.categoryCloth =  await this.appService.getFilteredCollection('outfitsCategories',[])
        
        this.subCategoryCloth  = await this.appService.getFilteredCollection('outfitsSubCategories',[])
                
        this.groupItemsByCategory();
      }
    });
  }

  async groupItemsByCategory() {

    let filter =[{
      field:'userId',
      operator:'==',
      value:this.userID 
    }]
    let dataR = await this.appService.getFilteredCollection('wardrobes', filter)

    this.wardrobesGrupped = this.categoryCloth;
  
    const groupedItems =  dataR.reduce((result: any[], item: wardrobesItem) => {
      const category = item.outfitCategory;
      
      // Filtrare la categoria corrispondente dal tuo array `categoryCloth`
      const filter = this.categoryCloth.find(ress => ress.id == category);
      const subCategores = this.subCategoryCloth.filter(res => res.parent == category);
      
      // Trova l'oggetto della categoria esistente o crea un nuovo oggetto
      let categoryObject = result.find(cat => cat.wardrobesCategory === (filter ? filter.value : '-'));
      
      if (!categoryObject) {
        categoryObject = {
          wardrobesCategory: filter ? filter.value : '-',
          outfitCategoryID:filter?.id,
          wardrobesSubCategory: subCategores.map(reM => reM.value).join(','),
          items: []
        };
        result.push(categoryObject);
      }
      
      // Aggiungere l'outfit alla categoria corretta
      categoryObject.items.push(item);
      
      return result;
    }, []);
    
    this.wardrobesItems.set(groupedItems); // Aggiorna il segnale con il nuovo array
    
    
  }

  
  objectKeys(obj: any): string[] {
    let key = Object.keys(obj);
    
    return Object.keys(obj);
  }

  async deleteItemWadro(item: any) {
    
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
      this.groupItemsByCategory();
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

   
    const id = this.generateGUID();
    let saveData:wardrobesItem = {
      brend: data.brend,
      id: id,
      images: [],
      name: data.name,
      outfitCategory: categoryID,
      outfitSubCategory: subCategoryID,
      color:data.color,
      userId: this.userID
    }

    let resSave = await this.appService.saveInCollection('wardrobes',undefined,saveData)
    if (resSave) {
      

      this.wardrobesItems.update((groups) => {
        let group = groups.find((g) => g.outfitCategoryID === categoryID);
        if (group) {
          group.items.push(saveData);
        }
        return groups;
      });
    }
    return data
  }

  searchClothModal(){
    alert('nessun prodotto presente nei nostri archvi')
  }

  generateGUID(): any {
    function s4(): any {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }
}
