import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-products-grid',
  templateUrl: './products-grid.component.html',
  styleUrls: ['./products-grid.component.scss'],
})
export class ProductsGridComponent {
  @Input() products: any[] = [];
  @Output() productsEvent = new EventEmitter<any>();
  constructor() { }
  
  async buyToStore(itm: any) {
    let link = !itm.link ? '#' : itm.link

    if (link != '#') {
      await Browser.open({ url: link });
    }
  }

  saveToWardrobe(evtProduct:any){
    this.productsEvent.emit(evtProduct);
  }
}
