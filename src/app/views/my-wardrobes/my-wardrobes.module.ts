import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyWardrobesPageRoutingModule } from './my-wardrobes-routing.module';

import { MyWardrobesPage } from './my-wardrobes.page';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ComponentsModule } from 'src/app/components/components.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    
    SharedModule,
    FormsModule,
    IonicModule,
    MyWardrobesPageRoutingModule,
    ScrollingModule,
    ComponentsModule
  ],
  declarations: [MyWardrobesPage]
})
export class MyWardrobesPageModule {}
