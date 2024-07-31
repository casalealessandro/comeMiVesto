import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddOutfitPageRoutingModule } from './add-outfit-routing.module';

import { AddOutfitPage } from './add-outfit.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { FotoOutfitPageModule } from '../foto-outfit/foto-outfit.module';

@NgModule({
  imports: [
    CommonModule,
      ComponentsModule,
    FormsModule,
    IonicModule,
    FotoOutfitPageModule, 
    AddOutfitPageRoutingModule
  ],
  declarations: [AddOutfitPage]
})
export class AddOutfitPageModule {}
