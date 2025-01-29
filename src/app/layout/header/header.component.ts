import { Component, effect, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuController, ModalController, NavController } from '@ionic/angular';
import { UserProfile } from 'src/app/service/interface/user-interface';;
import { filter, Observable } from 'rxjs';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  /**
   * Input() canGoBack,showLogo,showUserInfo
   *
   * @type {boolean}
   * @description Posso settare le varibili in ingresso oppure posso gestirle secondo la logica del routing che ho creato nel metodo setShowElements
   */
  @Input() canGoBack: boolean = false;
  @Input() showLogo: boolean = true;
  @Input() showUserInfo: boolean = false;
  @Input() showTitleText: boolean = false;
  @Input() titleText: string | undefined;
  @Input() showCloseBtn: boolean = false;
  @Input() showMenuBtn: boolean = true;

  showHeader: boolean = true;

  userProfile = this.userProfileService.gUserProfile();
  uid: any;

  // 👇 Reading the whole state
  user = this.sharedData.data();

  /**
   * Setto le rotte in un array di stringhe, nelle quali non voglio che venga mostrato il bottone torna indietro
   *
   * @private
   * @type {Set<string>}
   */
  private initialRoutes: Set<string> = new Set(['/tabs/myoutfit']);

  private routes: Set<string> = new Set(['/tabs/my-profile', 'tabs/detail-outfit']);

  constructor(
    private userProfileService: UserService,
    private modalController: ModalController,
    private navController: NavController,
    private router: Router,
    private menuCtrl: MenuController,
    public sharedData: SharedDataService
  ) {

  }

  ngOnInit() {



    const userProfile = this.userProfile()
    this.uid = userProfile!.uid



    this.sharedData.staredData$.subscribe(res => {
      console.log('HeaderComponent', res);
      const sData = this.sharedData.data().filter(data => data.componentName === "HeaderComponent");
      console.log('Header', sData)
      this.serVariable(sData[0].data)
      //this.setShowElements()
    })


    if (this.showTitleText) {
      if (typeof this.titleText == 'undefined') {
        console.error('Please set property titleText in @Input()')
      }
    }
  }
  serVariable(varObject: any) {
    this.canGoBack = varObject.canGoBack;
    this.showLogo = varObject.showLogo;
    this.showUserInfo = varObject.showUserInfo;
    this.showTitleText = varObject.showTitleText;;
    this.titleText = varObject.titleText;
    this.showCloseBtn = varObject.showCloseBtn;
  }

  setShowElements() {
    const currentUrl = this.router.url;
    this.canGoBack = !this.initialRoutes.has(currentUrl);



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

  async toggleMenu() {
    const isActive = await this.menuCtrl.isOpen()
    if (isActive) {
      this.menuCtrl.close()
    } else {
      this.menuCtrl.open()
    }
  }


}
