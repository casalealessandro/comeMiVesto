import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { SharedDataService } from 'src/app/service/shared-data.service';

@Component({
  selector: 'app-layout-tabs',
  templateUrl: './layout-tabs.page.html',
  styleUrls: ['./layout-tabs.page.scss'],
})
export class LayoutTabsPage  {

  canGoBack:boolean=false
  showHeader:boolean=true
  constructor(private sharedData: SharedDataService,private navController: NavController,private router: Router) { }
  
  onTabChange(event: any) {
    const selectedTab = event.tab;
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
              titleText:'Inserisci outfit',
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
