import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.page.html',
  styleUrls: ['./terms-conditions.page.scss'],
})
export class TermsConditionsPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent | undefined;
  isScrollAtBottom: boolean = false; // Flag per tenere traccia se l'utente ha raggiunto il fondo della pagina
  modalController = inject(ModalController)
  Data:any
  constructor(private navController: NavController,) { }

  ngOnInit() {  
    const da =  new Date()
    this.Data =`${da.getMonth() +1}/${da.getFullYear()}`
  }
  
  onScroll(event: any) {
    const scrollElement = event.detail.scrollElement;
    const scrollTop = scrollElement.scrollTop;
    const scrollHeight = scrollElement.scrollHeight;
    const offsetHeight = scrollElement.offsetHeight;

    // Se l'utente è a fine pagina, abilita il flag
    this.isScrollAtBottom = (scrollTop + offsetHeight) >= scrollHeight;
  }

  // Funzione per chiudere la pagina se l'utente ha scrollato fino alla fine
  closePage() {
    if (this.isScrollAtBottom) {
      this.handleBackButton(); // Naviga indietro (chiude la pagina)
    } else {
      alert("Devi scorrere fino in fondo per poter accettare e chiudere!");
    }
  }
  async handleBackButton() {
   
    // Altrimenti, esegui il comportamento predefinito del back button
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
