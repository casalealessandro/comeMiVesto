import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyoutfitPageRoutingModule } from './myoutfit-routing.module';

import { MyOutFitPage } from './myoutfit.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FotoOutfitPageModule } from "../foto-outfit/foto-outfit.module";
import { CurrencyFormatPipe } from 'src/app/utility/currency-format.pipe';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FotoOutfitPageModule,
    ComponentsModule,
    ScrollingModule,
    MyoutfitPageRoutingModule,
    
],
  declarations: [MyOutFitPage]
})
export class MyOutFitPageModule {}
