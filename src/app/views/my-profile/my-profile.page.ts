import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
import { UserService } from 'src/app/service/user.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { outfit, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AddOutfitPage } from '../add-outfit/add-outfit.page';
import { Router } from '@angular/router';
import { AppService } from 'src/app/service/app-service';
import { SharedDataService } from 'src/app/service/shared-data.service';
@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],


})
export class MyProfilePage implements OnInit {

  outfitNumber: number = 0;

  userProfile$= this.userProfileService.gUserProfile();
  userOutfits$!: Observable<outfit[]>;
  userWardrobes$!: Observable<wardrobesItem[]>;
  faveUserOutfits$= this.userProfileService.getFaveUserOutfits();
  userOutfits!: outfit[];
  wardrobesNumber: number = 0;
  userWardrobes!: wardrobesItem[];
  faveUserOutfitsNumber: number = 0;
  //faveUserOutfits!: any[];

  uid: string | undefined;
  userPreference!: UserPreference | null;
  segmentButtons = [
    {
      value: 'outfit',
      contentId: 'outfit',
      icon: 'fi fi-rr-magic-wand',
      label: 'Outfit creati',
      number: 42, // Sostituisci con la variabile dinamica outfitNumber
    },
    {
      value: 'wardrobes',
      contentId: 'wardrobes',
      icon: 'fi fi-rr-shirt',
      label: 'Vestiti nell\'armadio',
      number: 120, // Sostituisci con la variabile dinamica wardrobesNumber
    },
    {
      value: 'fave',
      contentId: 'fave',
      icon: 'fi fi-rr-heart',
      label: 'Desiderati',
      number: 15, // Sostituisci con la variabile dinamica faveUserOutfitsNumber
    },
  ];

  selectedSegment = 'outfit'; // Valore predefinito


  constructor(
      private userProfileService: UserService,
      private appService: AppService, 
      private navController: NavController,
      private modalController: ModalController, 
      private alert: AlertController, 
      private sharedData: SharedDataService) { }

  async ngOnInit() {

    //this.userProfile$ = this.userProfileService.getUserProfile();
    this.userOutfits$ = this.userProfileService.getUserOutfits();
    this.userWardrobes$ = this.userProfileService.getUserWardrobes();
   
    this.userPreference = await this.userProfileService.getUserPreference();



    this.uid = this.userProfile$()?.uid;
    
    
   
    
    this.userOutfits$.subscribe(outfits => {
      this.outfitNumber = outfits.length;
      this.segmentButtons[0].number =this.outfitNumber 
      this.userOutfits = outfits
    });

    this.userWardrobes$.subscribe(wardrobes => {
      this.wardrobesNumber = wardrobes.length;

      this.segmentButtons[1].number =this.wardrobesNumber 
      this.userWardrobes = wardrobes
    });
    
    this.faveUserOutfits$ = this.userProfileService.getFaveUserOutfits();
    
    const faveUserOutfits = this.faveUserOutfits$()
    
      this.faveUserOutfitsNumber = faveUserOutfits.length;
      this.segmentButtons[2].number =this.faveUserOutfitsNumber 
      //this.faveUserOutfits = faveUserOutfits;
     //console.log(this.faveUserOutfits)
   

    
    
  }

  openMenu() {
    throw new Error('Method not implemented.');
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
  async changeProfilePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelPhoto: 'Seleziona dalla galleria ',
      promptLabelPicture: 'Scatta una foto',
      promptLabelCancel: 'Cancella',
    });

    if (image && image.dataUrl) {
      this.userProfileService.updateProfilePicture(image.dataUrl)
        .then(() => console.log('Profile picture updated'))
        .catch(error => console.error('Error updating profile picture:', error));
    }
  }

  async editProfile() {
    const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'profileForm',
        editData: this.userProfile$()
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data.email != this.userProfile$()!.email) {
      this.alert.create({
        header: 'Attenzione!',
        message: `Non è possibile cambiare email, pertanto l'email non verrà sostiuita`,
        buttons: ['Ok'],
      })
    }

    let displayName = !data.displayName ? `${data.name} ${data.cognome}` : data.displayName
    let bio = !data.bio ? '' : data.bio;
    let nome = !data.nome ? data.name : '';

    let profileData: Partial<UserProfile> = {
      uid: this.uid,
      displayName: displayName,
      cognome: data.cognome,
      name: data.name,
      nome: nome,
      email: this.userProfile$()?.email,
      bio: bio,
      gender: data.gender,
      editedAt: new Date().getTime()

    }
    this.userProfileService.updateUserProfile(profileData).subscribe(data=>{
      const isOk = data? true : false;
      if (isOk) {
        this.alert.create({
          header: 'Attenzione!',
          message: `Profilo aggiornato`,
          buttons: ['Ok'],
        })
        //this.userProfile = profileData;
      }
    });
    

  }

  async editUserPreference() {
    //usersPreferenceForm
    console.log('editUserPreference', this.userPreference)
    const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'usersPreferenceForm',
        editData: this.userPreference
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    let color = !data.color ? [] : data.color
    let brend = !data.brend ? [] : data.brend
    let style = !data.style ? [] : data.style
    let uIdBlocked = !this.userPreference ? [] : this.userPreference.uIdBlocked

    let profilePrefData: Partial<UserPreference> = {
      uid: this.uid,
      color: color,
      brend: brend,
      style: style,
      uIdBlocked: uIdBlocked

    }
    let isOk = await this.userProfileService.setUserPreference(profilePrefData)
    if (isOk) {
      
      this.alert.create({
        header: 'Attenzione!',
        message: `Preferenze aggiornate`,
        buttons: ['Ok'],
      })
    }
  }
  async openEditOutfit(outfitData: outfit) {
    //usersPreferenceForm

    const modal = await this.modalController.create({
      component: AddOutfitPage,
      componentProps: {
        isEditMode: true,
        outfitData: outfitData,
        showheader:true

      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();


  }
  async deleteOutfit(event: any, outfitData: outfit) {

    event.stopPropagation();
    event.preventDefault();

    let coditions = [

      {
        field: 'userId', operator: '==', value: outfitData.userId
      },
      {
        field: 'id', operator: '==', value: outfitData.id
      }
    ]
    let res = await this.appService.deleteDocuments('outfits', coditions)

    if (res) {
      this.userOutfits$ = this.userProfileService.getUserOutfits();
    }


  }

  async deletewardrobesitem(event: any, wardrobesItem: wardrobesItem) {

    event.stopPropagation();
    event.preventDefault();

    let coditions = [

      {
        field: 'userId', operator: '==', value: wardrobesItem.userId
      },
      {
        field: 'id', operator: '==', value: wardrobesItem.id
      }
    ]
    let res = await this.appService.deleteDocuments('wardrobes', coditions)

    if (res) {
      this.userWardrobes$ = this.userProfileService.getUserWardrobes();
    }


  }
  async deleteFaveOutfit(event: any, faveItem: any) {

    event.stopPropagation();
    event.preventDefault();

    let coditions = [

      {
        field: 'userId', operator: '==', value: this.uid
      },
      {
        field: 'outfitId', operator: '==', value: faveItem.id
      }
    ]
    let res = await this.appService.deleteDocuments('faveUserOutfits', coditions)
/* 
    if (res) {
     this.faveUserOutfits$ = this.userProfileService.getFaveUserOutfits(this.uid);
     this.faveUserOutfits$.subscribe(async faveUserOutfits => {
      this.faveUserOutfitsNumber = faveUserOutfits.length;
      this.segmentButtons[2].number =this.faveUserOutfitsNumber 
      this.faveUserOutfits = faveUserOutfits;
      console.log(this.faveUserOutfits)
    }) 
    }*/


  }

  
  // Funzione per gestire l'evento di cambio segmento
  onSegmentChange(event: CustomEvent) {
    this.selectedSegment = event.detail.value; // Valore del pulsante selezionato
    
  }
}
