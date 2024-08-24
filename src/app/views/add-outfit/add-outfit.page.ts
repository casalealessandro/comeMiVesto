import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AppService } from 'src/app/service/app-service';
import { outfit, Tag } from 'src/app/service/interface/outfit-all-interface';

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

  constructor(

    private appService: AppService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private loading: LoadingController,
    private modalController: ModalController,
    private alert: AlertController,
    private navController: NavController
  ) {

  }


  ngOnInit() {
    this.resetOutfit();

    if (this.isEditMode) {
      this.outfit = this.outfitData;
      this.imgUrl = this.outfit.imageUrl
      this.tags = this.outfit.tags
    }
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
      userId: ''

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
      let data = {
        tags: this.tags
      }
      let responseSave = await this.editOutfit(data)
      if (responseSave) {
        this.outfit.tags = this.tags;
        this.outfitData.tags = this.tags;
      }
    }
  }

  saveOutfit(event: any) {

    this.title = event.title;
    this.color = event.color;
    this.description = event.description;
    this.gender = event.gender;
    this.season = event.season;
    this.style = event.style;

    if (!this.isEditMode) {
      this.confirmOutfit()
    } else {
      let oartialOutfit = {

        title: this.title,
        description: this.description,
        tags: this.tags,
        gender: this.gender,
        style: this.style,
        season: this.season,
        color: this.color,

      };
      this.editOutfit(oartialOutfit)
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
        userId: user.uid
      };
    }

    let nRND = Math.floor(Math.random() * (5 - 1 + 1)) + 1;


    let res = await this.appService.saveInCollection('outfits', id, this.outfit)

    if (res) {

      this.router.navigate(['/myoutfit'], { skipLocationChange: true, replaceUrl: true }).then(res => {
        this.resetOutfit()
        this.loading.dismiss();
      });
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

    this.tags[indexTag] =
    {
      id: tag.id,
      name: data.name,
      x: tag.x,
      y: tag.y,
      link: data.link,
      color: data.color,
      brend: data.brend,
      outfitCategory: data.outfitCategory,
      outfitSubCategory: data.outfitSubCategory

    }



    let id = this.outfitData.id

    if (!id) {
      return
    }

    let dataS = {
      tags: this.tags
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
}
