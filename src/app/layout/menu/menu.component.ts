import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, ModalController, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { UserPreference, UserProfile } from 'src/app/service/interface/user-interface';
import { UserService } from 'src/app/service/user.service';
import { TermsConditionsPage } from 'src/app/views/terms-conditions/terms-conditions.page';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  
  //userProfile$:UserProfile | null= this.userProfileService._userInfo();
  userProfile = this.userProfileService.gUserProfile();
  modalController = inject(ModalController)
  
  constructor(private router: Router, private userProfileService: UserService, private alert: AlertController,private menuCtrl: MenuController,private navCtrl: NavController) { }
  
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



  navUserProfile() {
    this.router.navigate(['/tabs/my-profile']).then(() => {this.closeMenu()});
  }
  closeMenu(){
    this.menuCtrl.close()
  }
  async logOut() {
    let logout = await this.userProfileService.logOut()
   
      
    if (logout) {
      sessionStorage.clear()
      //this.router.navigate(['/login']);
      this.navCtrl.navigateRoot('/login'); // Reset totale della navigazione
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
