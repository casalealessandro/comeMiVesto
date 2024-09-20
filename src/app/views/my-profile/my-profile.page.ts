import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
import { UserService } from 'src/app/service/user.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { outfit, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { AlertController, ModalController } from '@ionic/angular';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AddOutfitPage } from '../add-outfit/add-outfit.page';
import { Router } from '@angular/router';
import { AppService } from 'src/app/service/app-service';
@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage {
  outfitNumber: number = 0;

  userProfile$!: Observable<UserProfile | null>;
  userOutfits$!: Observable<outfit[]>;
  userWardrobes$!: Observable<wardrobesItem[]>;
  faveUserOutfits$!: Observable<any[]>;
  userOutfits!: outfit[];
  wardrobesNumber: number = 0;
  userWardrobes!: wardrobesItem[];
  faveUserOutfitsNumber: number=0;
  faveUserOutfits!: any[];
  userProfile!: Partial<UserProfile>;
  uid: string | undefined;
  userPreference!:any
  constructor(private userProfileService: UserService,private appService:AppService ,private modalController:ModalController, private alert:AlertController,private ruote:Router) { }

  ngOnInit() {
    
    this.userProfile$ = this.userProfileService.getUserProfile();
    this.userOutfits$ = this.userProfileService.getUserOutfits();
    this.userWardrobes$ = this.userProfileService.getUserWardrobes();
    this.faveUserOutfits$ = this.userProfileService.getFaveUserOutfits();
    this.userPreference = this.userProfileService.getUserPreference();

    //console.log('userOutfits',this.userOutfits$)
    this.userProfile$.subscribe(userProfile=>{
      if(userProfile)
        this.userProfile = userProfile;
        this.uid = this.userProfile.uid
    })

    this.userOutfits$.subscribe(outfits=>{
      this.outfitNumber = outfits.length;
      this.userOutfits = outfits
    })

    this.userWardrobes$.subscribe(wardrobes=>{
      this.wardrobesNumber = wardrobes.length;
      this.userWardrobes = wardrobes
    })

    this.faveUserOutfits$.subscribe(faveUserOutfits=>{
      this.faveUserOutfitsNumber = faveUserOutfits.length;
      this.faveUserOutfits = faveUserOutfits
    })
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

  async editProfile(){
    const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'profileForm',
        editData:this.userProfile
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if(data.email != this.userProfile.email){
      this.alert.create({
        header: 'Attenzione!',
        message: `Non è possibile cambiare email, pertanto l'email non verrà sostiuita`,
        buttons: ['Ok'],
      })
    }

    let displayName = !data.displayName ? `${data.name } ${data.cognome}` :  data.displayName
    let bio = !data.bio ? '' : data.bio;
    let nome = !data.nome ? data.name : '';

    let profileData:Partial<UserProfile> ={
      uid:this.uid ,
      displayName: displayName,
      cognome: data.cognome,
      name: data.name,
      nome:nome,
      email: this.userProfile.email,
      bio:bio
      
    }
    let isOk = await this.userProfileService.updateUserProfile(profileData)
    if(isOk){
      this.alert.create({
        header:'Attenzione!',
        message: `Profilo aggiornato`,
        buttons: ['Ok'],
      })
      this.userProfile = profileData;
    }
    
  }

  async editUserPreference(){
    //usersPreferenceForm

    const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'usersPreferenceForm',
        editData:this.userPreference
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    let color = !data.color ? [] : data.color
    let brend = !data.brend ? [] : data.brend
    let style = !data.style ? [] : data.style

     let profilePrefData:Partial<UserPreference> ={
      uid:this.uid ,
      color: color,
      brend: brend,
      style: style,
      
    }
    let isOk = await this.userProfileService.setUserPreference(profilePrefData)
    if(isOk){
      this.alert.create({
        header:'Attenzione!',
        message: `Preferenze aggiornate`,
        buttons: ['Ok'],
      })
    }
  }
  async openEditOutfit(outfitData:outfit){
    //usersPreferenceForm

    const modal = await this.modalController.create({
      component: AddOutfitPage,
      componentProps: {
        isEditMode: true,
        outfitData:outfitData
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    
  }
  async deleteOutfit(event:any,outfitData:outfit){

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

  async logOut(){
    let logout = await this.userProfileService.logOut()

    if(logout){
      this.ruote.navigate(['/login'])
    }
  }

  async deleteAccount(){
    
    const alert = await this.alert.create({
        header:'Attenzione!',
        message: `Confermi la cancellazione dell'account?`,
        buttons: [
          {
            text: 'Annulla',
            role: 'cancel',
            handler: () => {
             
            }
          },
          {
            text: 'Conferma',
            handler: async () => {
              await this.userProfileService.deleteAccount()
              
            
            }
          }
        ]
      })
      await alert.present();
    
  }
}
