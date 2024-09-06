import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyoutfitPageRoutingModule } from './myoutfit-routing.module';

import { MyOutFitPage } from './myoutfit.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FotoOutfitPageModule } from "../foto-outfit/foto-outfit.module";


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ComponentsModule,
    ScrollingModule,
    MyoutfitPageRoutingModule,
    FotoOutfitPageModule
],
  declarations: [MyOutFitPage,]
})
export class MyOutFitPageModule {}
