import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LayoutTabsPageRoutingModule } from './layout-tabs-routing.module';

import { LayoutTabsPage } from './layout-tabs.page';
import { ComponentsModule } from "../../components/components.module";


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LayoutTabsPageRoutingModule,
    ComponentsModule,
    
],
  declarations: [LayoutTabsPage]
})
export class LayoutTabsPageModule {}
