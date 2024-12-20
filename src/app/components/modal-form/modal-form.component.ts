import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html',
  styleUrls: ['./modal-form.component.scss'],
})
export class ModalFormComponent  {
  @Input() service: any = null;
  @Input() title: string = '';
  @Input() editData: any = {};
  constructor(private modalController: ModalController) {}

  
  dismiss() {
    this.modalController.dismiss();
  }

  applyData(event:any) {
    this.modalController.dismiss(event);
  }

  functionalInputFormEvent(evet:any){
    this.modalController.dismiss(evet);
  }

}
