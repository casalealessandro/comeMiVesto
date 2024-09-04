import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FilterOutfitsPageRoutingModule } from './filter-outfits-routing.module';

import { FilterOutfitsPage } from './filter-outfits.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FilterOutfitsPageRoutingModule
  ],
  declarations: [FilterOutfitsPage]
})
export class FilterOutfitsPageModule {}
