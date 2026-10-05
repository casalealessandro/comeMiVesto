import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DeleteAccountPageRoutingModule } from './delete-account-routing.module';
import { DeleteAccountPage } from './delete-account.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    DeleteAccountPageRoutingModule
  ],
  declarations: [DeleteAccountPage]
})
export class DeleteAccountPageModule {}
