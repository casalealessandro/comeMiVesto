import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from 'src/app/service/user.service';
import { PreferencesOnboardingComponent } from 'src/app/components/preferences-onboarding/preferences-onboarding.component';

@Component({
  standalone: false,
  selector: 'app-layout-tabs',
  templateUrl: './layout-tabs.page.html',
  styleUrls: ['./layout-tabs.page.scss'],
})
export class LayoutTabsPage implements OnInit {

  private destroyRef = inject(DestroyRef);
  canGoBack:boolean=false
  showHeader:boolean=true
  tabLoading:boolean=false
  hideBottomBar:boolean=false
  private tabLoadingTimeout:any
  private preferencesOnboardingOpen = false;
  private readonly preferencesOnboardingSkippedKey = 'preferencesOnboardingSkipped';

  constructor(
    private sharedData: SharedDataService,
    private navController: NavController,
    private router: Router,
    private modalController: ModalController,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.hideBottomBar = this.router.url.includes('/tabs/add-outfit');

    this.sharedData.staredData$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const layoutData = this.sharedData.getData('LayoutTabsComponent');
      if (!layoutData.length || typeof layoutData[0]?.data?.hideBottomBar !== 'boolean') {
        return;
      }
      this.hideBottomBar = layoutData[0].data.hideBottomBar;
    });
  }
  
  async ionViewDidEnter(): Promise<void> {
    await this.openPreferencesOnboardingIfNeeded();
  }

  private async openPreferencesOnboardingIfNeeded(): Promise<void> {
    if (this.preferencesOnboardingOpen || sessionStorage.getItem(this.preferencesOnboardingSkippedKey) === 'true') {
      return;
    }

    const userLoaded = await this.userService.loadUser();
    if (!userLoaded || this.userService.gPreferencesConfigured()()) {
      return;
    }

    this.preferencesOnboardingOpen = true;
    try {
      const modal = await this.modalController.create({
        component: PreferencesOnboardingComponent,
        cssClass: 'cmv-preferences-onboarding',
        backdropDismiss: false,
      });
      await modal.present();

      const { role } = await modal.onDidDismiss();
      if (role === 'skip') {
        sessionStorage.setItem(this.preferencesOnboardingSkippedKey, 'true');
      } else if (role === 'complete') {
        sessionStorage.removeItem(this.preferencesOnboardingSkippedKey);
      }
    } finally {
      this.preferencesOnboardingOpen = false;
    }
  }

  onTabWillChange() {
    if (this.tabLoadingTimeout) {
      clearTimeout(this.tabLoadingTimeout)
    }
    this.tabLoading = true
  }

  onTabChange(event: any) {
    this.tabLoadingTimeout = setTimeout(() => {
      this.tabLoading = false
    }, 250)
    const selectedTab = event.tab;
    this.hideBottomBar = selectedTab === 'add-outfit';
    console.log('Selected tab:', event);
    switch (selectedTab) {
      case 'myoutfit':
        this.sharedData.setData({
          componentName:'HeaderComponent',
          data: {
           
            showLogo:true,
            showUserInfo:false,
           
          }
        });

        break;
        case 'add-outfit':
          this.sharedData.setData({
            componentName:'HeaderComponent',
            data: {
             
              showLogo:false,
              showUserInfo:false,
              showTitleText:true,
              titleText:'Crea outfit',
              showSubtitleText:true,
              subtitleText:'Combina i tuoi capi per creare un look completo.',
              canGoBack:true
             
            }
          });
  
          break;
     case 'my-profile':
      this.sharedData.setData({
        componentName:'HeaderComponent',
        data: {
          
          showLogo:false,
          showUserInfo:true,
          canGoBack:true
        }
      })
      break;
      case 'outfit-products':
        this.sharedData.setData({
          componentName:'HeaderComponent',
          data: {
            
            showLogo:true,
            canGoBack:true
          }
        })
        break;
      case 'my-wardrobes':
        this.sharedData.setData({
          componentName:'HeaderComponent',
          data: {
            
           
          showLogo:false,
          showUserInfo:false,
          showTitleText:true,
          titleText:'Armadio personale',
          canGoBack:true
          }
        })
        break;
      default:
        break;
    }
    // Logica aggiuntiva basata sulla scheda selezionata
    if (selectedTab === 'settings') {
      console.log('Navigato a Settings');
    }
  }
  
  

}
