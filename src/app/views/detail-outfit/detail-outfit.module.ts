import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailOutfitPageRoutingModule } from './detail-outfit-routing.module';

import { DetailOutfitPage } from './detail-outfit.page';
import { CurrencyFormatPipe } from 'src/app/utility/currency-format.pipe';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailOutfitPageRoutingModule,
    SharedModule
  ],
  declarations: [DetailOutfitPage]
})
export class DetailOutfitPageModule {}
