import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalController } from '@ionic/angular';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AppService } from 'src/app/service/app-service';
import { categoryCloth, outfitCategories, Tag, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { ProdottiOnlinePage } from '../prodotti-online/prodotti-online.page';
import { Browser } from '@capacitor/browser';
import { Observable } from 'rxjs';
import { UserProfile } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-wardrobes',
  templateUrl: './my-wardrobes.page.html',
  styleUrls: ['./my-wardrobes.page.scss'],
})
export class MyWardrobesPage implements OnInit  {

  @Output() selectedItem:EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;

  [x: string]: any;
  wardrobesItems = this.appService.resultsSignal; // Utilizza signal per rendere reattivo l'array
  userWardrobes: any[] = []; // Array per gli outfit filtrati
  wardrobesGrupped: any = []
  userID: string =''
  groupedItems: any = {};
  categoryCloth:outfitCategories[] = [];
  subCategoryCloth:outfitCategories[] = [];
  openModal:any = null
 
  constructor(private appService: AppService, private afAuth: AngularFireAuth,private modalController:ModalController,private userProfileService:UserService,private router:Router) { }

  ngOnInit() {
    
   
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        console.log('user',user)
        this.userID = user.uid;
        
        this.categoryCloth =  await this.appService.getFilteredCollection('outfitsCategories',[{
          field: 'parentCategory',
          operator: '==',
          value: ""
        }])
        
       // this.subCategoryCloth  = await this.appService.getFilteredCollection('outfitsSubCategories',[])
                
        this.groupItemsByCategory();

       this.openModal = await this.modalController.getTop();
      
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
      const subCategores = this.categoryCloth.filter(res => res.parentCategory == category);
      
      // Trova l'oggetto della categoria esistente o crea un nuovo oggetto
      let categoryObject = result.find(cat => cat.wardrobesCategory === (filter ? filter.categoryName : '-'));
      
      if (!categoryObject) {
        categoryObject = {
          wardrobesCategory: filter ? filter.categoryName : '-',
          outfitCategoryID:filter?.id,
          wardrobesSubCategory: subCategores.map(reM => reM.categoryName).join(','),
          items: []
        };
        result.push(categoryObject);
      }
      
      // Aggiungere l'outfit alla categoria corretta
      categoryObject.items.push(item);
      
      return result;
    }, []);
    
    this.wardrobesItems.set(groupedItems); // Aggiorna il segnale con il nuovo array
    this.userWardrobes = [...groupedItems]
    
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
    if(!data){
      return
    }
    
    const categoryID = data.outfitCategory;
    const subCategoryID = data.outfitSubCategory;
    const link = !data.link ? '#' : data.link
   
   
    const id = this.generateGUID();
    let saveData:wardrobesItem = {
      brend: data.brend,
      id: id,
      images: data.Images,
      name: data.name,
      outfitCategory: categoryID,
      outfitSubCategory: subCategoryID,
      color:data.color,
      userId: this.userID,
      prezzo: parseInt(data.price, 10),
      link: link,
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

  async searchClothModal(){
    const modal = await this.modalController.create({
      component: ProdottiOnlinePage,
      
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if(!data){
      return
    }
    const dataP = data.data;
    const categoryID = dataP.outfitCategory;
    const subCategoryID = dataP.outfitSubCategory;
    const link = !dataP.link ? '#' : dataP.link
   
    const id = this.generateGUID();

    let saveData:wardrobesItem = {
      brend: dataP.brend,
      id: id,
      images: dataP.imageUrl,
      name: dataP.name,
      outfitCategory: categoryID,
      outfitSubCategory: subCategoryID,
      color:dataP.color,
      userId: this.userID,
      prezzo:parseInt(dataP.price, 10),
      link:link
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

  generateGUID(): any {
    function s4(): any {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  // Funzione link allo store
  async buyToStore(prod: any) {
    let link = !prod.link ? '#' : prod.link

    if (link != '#') {
      await Browser.open({ url: link });
    }
  }
  async selectItem(item:any){
    // Controlla se la pagina è aperta in un modale
    const modal = await this.modalController.getTop();
    if (modal) {
     this.modalController.dismiss(item)
    }else{
      console.log('selectItem',item);
      this.selectedItem.emit(item)
    }
    
  }

  dismissModal(evet:any){
    this.modalController.dismiss()
  }

  navUserProfile() {
    this.router.navigate(['/tabs/my-profile'])
  }
}
