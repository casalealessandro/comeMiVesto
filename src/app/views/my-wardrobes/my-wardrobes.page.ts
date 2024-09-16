import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
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

  @Output() selectedItem:EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;

  [x: string]: any;
  wardrobesItems = this.appService.resultsSignal; // Utilizza signal per rendere reattivo l'array
  wardrobesGrupped: any = []
  userID: string =''
  groupedItems: any = {};
  categoryCloth:categoryCloth[] = [];
  subCategoryCloth:categoryCloth[] = [];
  openModal:any = null
  
  constructor(private appService: AppService, private afAuth: AngularFireAuth,private modalController:ModalController,) { }

  ngOnInit() {


    this.afAuth.authState.subscribe(async user => {
      if (user) {
        this.userID = user.uid;
        
        this.categoryCloth =  await this.appService.getFilteredCollection('outfitsCategories',[])
        
        this.subCategoryCloth  = await this.appService.getFilteredCollection('outfitsSubCategories',[])
                
        this.groupItemsByCategory();

       this.openModal = await this.modalController.getTop();

        console.log('pmodal',this.openModal)
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
        field: 'id', operator: '==', value: item.id
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
    
    const categoryID = data.outfitCategory;
    const subCategoryID = data.outfitSubCategory;

   
    const id = this.generateGUID();
    let saveData:wardrobesItem = {
      brend: data.brend,
      id: id,
      images: data.Images,
      name: data.name,
      outfitCategory: categoryID,
      outfitSubCategory: subCategoryID,
      color:data.color,
      userId: this.userID
    }

    let resSave = await this.appService.saveInCollection('wardrobes',undefined,saveData)
    if (resSave) {
      
      this.groupItemsByCategory();

      //Mando i dati on uscita
      const modal = await this.modalController.getTop();
      if (modal) {
        this.modalController.dismiss(saveData)
      }else{
        this.selectedItem.emit(saveData);
      }
      

      
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

  async selectItem(item:any){
    // Controlla se la pagina è aperta in un modale
    const modal = await this.modalController.getTop();
    if (modal) {
     this.modalController.dismiss(item)
    }else{
      this.selectedItem.emit(item)
    }
    
  }

  dismissModal(evet:any){
    this.modalController.dismiss()
  }
}
