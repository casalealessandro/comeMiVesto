import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddOutfitPageRoutingModule } from './add-outfit-routing.module';

import { AddOutfitPage } from './add-outfit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddOutfitPageRoutingModule
  ],
  declarations: [AddOutfitPage]
})
export class AddOutfitPageModule {}
