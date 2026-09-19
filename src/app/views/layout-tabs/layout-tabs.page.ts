import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  constructor(private sharedData: SharedDataService,private navController: NavController,private router: Router) { }

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
