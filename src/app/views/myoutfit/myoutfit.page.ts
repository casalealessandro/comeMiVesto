import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';


import { AnagraficaService } from 'src/app/service/anagrafica-service';
import { outfit } from 'src/app/service/interface/outfit-all-interface';
@Component({
  selector: 'app-myoutfit',
  templateUrl: './myoutfit.page.html',
  styleUrls: ['./myoutfit.page.scss'],
})
export class MyOutFitPage implements OnInit {
  outfits:outfit[]=[]
  isLoading: boolean=true;

  constructor(private anagraficaService:AnagraficaService, private modalController: ModalController) {}

  ngOnInit() {
    this.loadOutfits();
  }

  async openFilterModal() {
    return
  }

 

  loadOutfits(): void {
    this.isLoading = true;
    this.anagraficaService.getOutfits('user_0001').subscribe((newOutfits:outfit[]) => {
      this.outfits = newOutfits
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
