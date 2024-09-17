import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout-tabs',
  templateUrl: './layout-tabs.page.html',
  styleUrls: ['./layout-tabs.page.scss'],
})
export class LayoutTabsPage implements OnInit {
  canGoBack:boolean=false
  constructor(private modalController: ModalController,private navController: NavController,private router: Router) { }
  private initialRoutes: Set<string> = new Set(['/tabs/myoutfit']);
  ngOnInit() {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
     this.shouldShowBackButton();
    });
  }

  shouldShowBackButton() {
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
}
