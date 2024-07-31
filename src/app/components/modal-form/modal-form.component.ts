import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html',
  styleUrls: ['./modal-form.component.scss'],
})
export class ModalFormComponent  implements OnInit {
  @Input() service: any = null;

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {

  }
  dismiss() {
    this.modalController.dismiss();
  }

  applyData(event:any) {
    this.modalController.dismiss(event);
  }

}
