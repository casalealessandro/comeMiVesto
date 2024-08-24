import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-list',
  templateUrl: './modal-list.component.html',
  styleUrls: ['./modal-list.component.scss'],
})
export class ModalListComponent {



  @Input() items: any[] = [];
  @Input() title: string = 'Lista';
  @Input() displayExpr:string = 'name';
  @Input() optionbuttonsItem:any = [];
  constructor(private modalController: ModalController) {}
 
  // Funzione per trovare la chiave dell'immagine
  getImageUrl(item: any): string | null {
    const imageKey = Object.keys(item).find(key => 
      typeof item[key] === 'string' && item[key].match(/\.(jpeg|jpg|gif|png)$/)
    );
    return imageKey ? item[imageKey] : null;
  }

  dismiss(event:any) {
    this.modalController.dismiss(event);
  }

  onItemSelected(item: any) {
    this.modalController.dismiss(item);
  }
  onButtonGenericClick(buttonItem: any,item:any){
      let evento ={
        name:buttonItem.actionName,
        item:item
      }
      this.modalController.dismiss(evento);
  }

  onButtonGenericClick2(eve: any){

    let evento ={
      name:'buttonGenericClic2',
      item:eve
    }
    this.modalController.dismiss(evento);
  }
}
