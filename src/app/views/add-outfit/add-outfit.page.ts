import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AppService } from 'src/app/service/app-service';
import { outfit, Tag, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';

import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { MyOutFitPage } from '../myoutfit/myoutfit.page';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
@Component({
  selector: 'app-add-outfit',
  templateUrl: './add-outfit.page.html',
  styleUrls: ['./add-outfit.page.scss'],
})
export class AddOutfitPage {

  @ViewChild('imageContainer', { static: false }) imageContainer: ElementRef | undefined;

  @Input() isEditMode: boolean = false;
  @Input() showheader: boolean = false;
  @Input() outfitData: any = {};
  image: Blob | undefined;
  tags: Tag[] = [];
  outfit!: outfit;
  title: string = '';
  description: string = '';
  showTag: boolean = false
  gender!: "" | "man" | "woman";
  style!: "" | "casual" | "elegant" | "sporty" | "formal";
  season!: "" | "winter" | "spring" | "summer" | "autumn";

  color: any;
  imgCapt: string = '';
  imgFileName: string = '';
  imgUrl: string = "";
  contentType!: any;
  myOutfit: any = MyOutFitPage
  openModal:any = null
  constructor(

    private appService: AppService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private loading: LoadingController,
    private modalController: ModalController,
    private alert: AlertController,
    private navController: NavController,
    
  ) {

  }


  async ngOnInit() {
    
    this.resetOutfit();

    if (this.isEditMode) {
      this.outfit = this.outfitData;
      this.imgUrl = this.outfit.imageUrl
      this.tags = this.outfit.tags
    }

    this.openModal = await this.modalController.getTop();
  }

  /* ionViewWillEnter() {
    this.resetOutfit();
  }
 */
  resetOutfit() {

    this.outfit = {
      id: '',
      title: '',
      description: '',
      imageUrl: '',
      tags: [],
      gender: '',
      style: '',
      season: '',
      userId: '',
      status:'pending',
    };
    this.image = undefined;

    this.title = '';
    this.description = '';
    this.showTag = false
    this.gender = ''
    this.style! = ""
    this.season! = "";
    this.color = "";
    this.imgCapt = '';
    this.imgFileName = '';
    this.contentType = null;
  }

  async setImageCaptured(event: any) {


    this.image = event.img;
    this.imgFileName = event.imgName;
    this.contentType = event.contentType;

    if (this.isEditMode) {
      let imageUrl = null


      this.loading.create({
        message: 'Salvataggio in corso...',
      })
      imageUrl = await this.appService.uploadImage(event.img, this.imgFileName, this.contentType);

      if(!imageUrl){
        return 
      }
      this.outfit.imageUrl = imageUrl

      this.editOutfit({ imageUrl: imageUrl })
    }
  }

  async setImageTagSet(event: any) {
    this.tags = event.tags as Tag[];

    if (this.isEditMode) {
      let mappedTag:any[] = [...this.tags];

      mappedTag = mappedTag.reduce(
        (acc, tag) => {
          // Se l'elemento non è già presente nell'array, aggiungilo
          if (!acc.outfitCategory.includes(tag.outfitCategory)) {
            acc.outfitCategory.push(tag.outfitCategory);
          }
          if (!acc.outfitSubCategory.includes(tag.outfitSubCategory)) {
            acc.outfitSubCategory.push(tag.outfitSubCategory);
          }
          if (!acc.color.includes(tag.color)) {
            acc.color.push(tag.color);
          }
          return acc;
        },
        { outfitCategory: [], outfitSubCategory: [], color: [] }
      );
      let dateEdit = new Date();
      let data = {
        tags: this.tags,
        editedAt:dateEdit.getTime(),
        ...mappedTag
      }
      let responseSave = await this.editOutfit(data)
      if (responseSave) {
        this.outfit.tags = this.tags;
        this.outfitData.tags = this.tags;

        this.outfit = {
          ...this.outfit,
          ...mappedTag
        }
      }
    }
  }

  async saveOutfit(event: any) {
console.log(event);
    this.title = event.title;
    this.color = event.color;
    this.description = !event.description ? "" : event.description;
    this.gender = event.gender;
    this.season = event.season;
    this.style = event.style;

    let mappedTag:any[] = [...this.tags];

    mappedTag = mappedTag.reduce(
      (acc, tag) => {
        // Se l'elemento non è già presente nell'array, aggiungilo
        if (!acc.outfitCategory.includes(tag.outfitCategory)) {
          acc.outfitCategory.push(tag.outfitCategory);
        }
        if (!acc.outfitSubCategory.includes(tag.outfitSubCategory)) {
          acc.outfitSubCategory.push(tag.outfitSubCategory);
        }
        if (!acc.color.includes(tag.color)) {
          if(typeof tag.color != 'undefined'){
            acc.color.push(tag.color);
          }
          
        }
        return acc;
      },
      { outfitCategory: [], outfitSubCategory: [], color: [] }
    );

    if (!this.isEditMode) {

      this.confirmOutfit()
    } else {
      let dateEdit = new Date();
      let partialOutfit = {

        title: this.title,
        description: this.description,
        tags: this.tags,
        gender: this.gender,
        style: this.style,
        season: this.season,
        color: this.color,
        editedAt:dateEdit.getTime(),
        ...mappedTag
      };
      let outfitSaveed =  await this.editOutfit(partialOutfit);
      const user = await this.afAuth.currentUser;
      const uid = !user?.uid ? '' : user?.uid
      if(outfitSaveed){
        
        

        this.handleBackButton()
      }
    }


  }

  async editOutfit(data: Partial<any>): Promise<boolean> {
    let id = this.outfitData.id
    let isOk = await this.appService.updateInCollection('outfits', id, data)

    if (isOk) {

      return true
    }
    return false
  }
  async confirmOutfit() {

    let imageUrl = null
    if (!this.title) {
      return
    }
    if (!this.image) {
      return
    } else {
      this.loading.create({
        message: 'Salvataggio in corso...',
      })
      imageUrl = await this.appService.uploadImage(this.image, this.imgFileName, this.contentType);

    }

    const user = await this.afAuth.currentUser;
    const id = this.generateGUID()
    if (user) {
      let mappedTag:any[] = [...this.tags];

    mappedTag = mappedTag.reduce(
      (acc, tag) => {
        // Se l'elemento non è già presente nell'array, aggiungilo
        if (!acc.outfitCategory.includes(tag.outfitCategory)) {
          acc.outfitCategory.push(tag.outfitCategory);
        }
        if (!acc.outfitSubCategory.includes(tag.outfitSubCategory)) {
          acc.outfitSubCategory.push(tag.outfitSubCategory);
        }
        if (!acc.color.includes(tag.color)) {
          acc.color.push(tag.color);
        }
        return acc;
      },
      { outfitCategory: [], outfitSubCategory: [], color: [] }
    );
    let dateCreate = new Date();
      this.outfit = {
        id: id,
        title: this.title,
        description: this.description,
        imageUrl: imageUrl,
        tags: this.tags,
        gender: this.gender,
        style: this.style,
        season: this.season,
        color: this.color,
        userId: user.uid,
        createdAt:dateCreate.getTime(),
        status:'pending',

        ...mappedTag
      };
    }

    let nRND = Math.floor(Math.random() * (5 - 1 + 1)) + 1;


    let res = await this.appService.saveInCollection('outfits', id, this.outfit)

    if (res) {
      alert("L'autfit inserito è in attesa di approvazione.")
     
      setTimeout(() => {
        
        this.handleBackButton()
        
      }, 800);
    }


  }

  async editTag(tag: Tag) {


    const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'tagForm',
        editData: tag,
        title: 'Modifica Tag'
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();


    let indexTag = this.tags.findIndex(r => r.id == tag.id)
    let link = !data.link ? '#' : data.link
    
    this.tags[indexTag] =
    {
      id: tag.id,
      name: data.name,
      x: tag.x,
      y: tag.y,
      link: link,
      color: data.color,
      brend: data.brend,
      prezzo: data.prezzo,
      outfitCategory: data.outfitCategory,
      outfitSubCategory: data.outfitSubCategory

    }



    let id = this.outfitData.id

    if (!id) {
      return
    }
    
    let dateEdit = new Date();

    let dataS = {
      tags: this.tags,
      editedAt:dateEdit.getTime()
    }

    let responseSave = await this.editOutfit(dataS)

    if (responseSave) {
      this.outfit.tags = this.tags;
      this.outfitData.tags = this.tags;
    }


  }

  async delTag(event: any, id: any) {
    event.preventDefault()
    event.stopPropagation()

    const alert = await this.alert.create({
      header: 'Attenzione!',
      message: `Vuoi rimuovere questo tag dell'outfit?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            //console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si',
          handler: () => {
            let indexTag = this.tags.findIndex(r => r.id == id)
            if (indexTag > -1) {
              this.tags.splice(indexTag, 1);

              this.editOutfit({ tags: this.tags })
            }
          }
        }
      ]
    });

    await alert.present();


    //this.tags[indexTag] 
  }

  //controllo immgini offensive 
  filterImage(imageBase64: string) {
    /* const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64, // La foto codificata in base64
          },
          features: [{ type: 'SAFE_SEARCH_DETECTION' }],
        },
      ],
    };
  
    return this.http.post('https://vision.googleapis.com/v1/images:annotate?key=API_KEY', requestBody)
      .toPromise()
      .then((response: any) => {
        const safeSearch = response.responses[0].safeSearchAnnotation;
        const isSafe = safeSearch.adult === 'VERY_UNLIKELY' && safeSearch.violence === 'VERY_UNLIKELY';
        return isSafe; // Ritorna true se il contenuto è sicuro
      }); */
  }

  generateGUID(): string {
    function s4(): string {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  async handleBackButton() {
    // Controlla se la pagina è aperta in un modale
    const modal = await this.modalController.getTop();
    if (modal) {
      // Se c'è un modale aperto, chiudi il modale
      modal.dismiss();
    } else {
      // Altrimenti, esegui il comportamento predefinito del back button
      this.navController.back();
    }
  }

  dismissModal(evet:any){
    this.modalController.dismiss()
  }
}
