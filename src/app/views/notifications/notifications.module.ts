import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { NotificationsPageRoutingModule } from './notifications-routing.module';
import { NotificationsPage } from './notifications.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ComponentsModule,
    NotificationsPageRoutingModule,
  ],
  declarations: [NotificationsPage],
})
export class NotificationsPageModule {}
