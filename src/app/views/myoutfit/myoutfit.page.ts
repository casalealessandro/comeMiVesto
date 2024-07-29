import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';

import { FilterModalPage } from '../filter-modal/filter-modal.page';
import { AnagraficaService } from 'src/app/service/anagrafica-service';
@Component({
  selector: 'app-myoutfit',
  templateUrl: './myoutfit.page.html',
  styleUrls: ['./myoutfit.page.scss'],
})
export class MyOutFitPage implements OnInit {
  outfits:any = [];
  isLoading: boolean=true;

  constructor(private anagraficaService:AnagraficaService, private modalController: ModalController) {}

  ngOnInit() {
    this.loadOutfits();
  }

  async openFilterModal() {
    const modal = await this.modalController.create({
      component: FilterModalPage
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.applyFilters(result.data);
      }
    });

    return await modal.present();
  }

 

  loadOutfits(): void {
    this.isLoading = true;
    this.anagraficaService.getOutfits('user_0001').subscribe(newOutfits => {
      this.outfits = [...this.outfits, ...newOutfits];
      this.isLoading = false;
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const scrollTop = (event.target as Document).documentElement.scrollTop;
    const scrollHeight = (event.target as Document).documentElement.scrollHeight;
    const clientHeight = (event.target as Document).documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 10 && !this.isLoading) {
      this.loadOutfits();
    }
  }

  applyFilters(filters?: null | undefined) {
    this.loadOutfits();
  }

}
