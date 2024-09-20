import { Component, Input, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { ModalController } from '@ionic/angular';
import { Tag } from 'src/app/service/interface/outfit-all-interface';

@Component({
  selector: 'app-detail-outfit',
  templateUrl: './detail-outfit.page.html',
  styleUrls: ['./detail-outfit.page.scss'],
})
export class DetailOutfitPage implements OnInit {
  @Input() tags!:Tag[] 
  @Input() image!:string
  constructor(private modalController:ModalController ) { }

  ngOnInit() {
    console.log('detai', this)
  }
  closeModalFullScreen(){
    this.modalController.dismiss() 
  }

  async openItmClothing(tag: Tag) {

    let link = !tag.link ? '#' : tag.link

    if (link != '#') {
      await Browser.open({ url: link });
    }
  }
}
