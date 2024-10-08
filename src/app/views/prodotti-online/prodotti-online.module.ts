import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProdottiOnlinePageRoutingModule } from './prodotti-online-routing.module';

import { ProdottiOnlinePage } from './prodotti-online.page';
import { SharedModule } from "../shared/shared.module";


@NgModule({
  imports: [
    
    SharedModule,
    FormsModule,
    IonicModule,
    ProdottiOnlinePageRoutingModule,
    
],
  declarations: [ProdottiOnlinePage]
})
export class ProdottiOnlinePageModule {}
