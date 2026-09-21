import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { FotoOutfitPageModule } from '../foto-outfit/foto-outfit.module';
import { ProductOutfitsPageRoutingModule } from './product-outfits-routing.module';
import { ProductOutfitsPage } from './product-outfits.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FotoOutfitPageModule,
    ComponentsModule,
    ProductOutfitsPageRoutingModule
  ],
  declarations: [ProductOutfitsPage]
})
export class ProductOutfitsPageModule {}
