import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-layout-tabs',
  templateUrl: './layout-tabs.page.html',
  styleUrls: ['./layout-tabs.page.scss'],
})
export class LayoutTabsPage implements OnInit {

  constructor(private modalController: ModalController,private navController: NavController) { }

  ngOnInit() {
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
