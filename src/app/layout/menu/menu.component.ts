import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
import { UserService } from 'src/app/service/user.service';
import { TermsConditionsPage } from 'src/app/views/terms-conditions/terms-conditions.page';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  
  userProfile$!:Observable<UserProfile | null>;
  userProfile!: Partial<UserProfile| null>;
  modalController = inject(ModalController)
  
  constructor(private router: Router, private userProfileService: UserService, private alert: AlertController,private menuCtrl: MenuController) { }
  
  menuListTop = [
    {
      link: 'terms-conditions', label: 'Termini e Conditioni', icon: 'fi fi-rr-user-lock', click: () => {
        this.functionalCheckBox()
      },

    },
    {
      link: 'notifiche', label: 'Notifiche', click: () => { }, icon: 'fi fi-rr-bell'
    },
    {
      link: 'help', label: 'Aiuto', click: () => {  }, icon: 'fi fi-rr-interrogation'
    }];

  menuListBottom = [
    {
      link: 'logOut', label: 'Log out', click: () => { this.logOut() }, icon: ''
    },
    {
      link: 'deleteAccount', label: 'Cancella account', click: () => { this.deleteAccount() }, icon: ''
    }
  ]


  ngOnInit() {
    this.userProfile$ = this.userProfileService.getUserProfile() as Observable<UserProfile | null>;
    //console.log('userOutfits',this.userOutfits$)
    this.userProfile$.subscribe(userProfile => {
      if (userProfile)
        this.userProfile = userProfile;
      
    })
  }
  navUserProfile() {
    this.router.navigate(['/tabs/my-profile']).then(() => {this.closeMenu()});
  }
  closeMenu(){
    this.menuCtrl.close()
  }
  async logOut() {
    let logout = await this.userProfileService.logOut()

    if (logout) {
      this.router.navigate(['/login'])
    }
  }

  async deleteAccount() {

    const alert = await this.alert.create({
      header: 'Attenzione!',
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

  async functionalCheckBox() {


    const modal = await this.modalController.create({
      component: TermsConditionsPage,
    })

    await modal.present();

    const { data } = await modal.onDidDismiss();
  }
}
