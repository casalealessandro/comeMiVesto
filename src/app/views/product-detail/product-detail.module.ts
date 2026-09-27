import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { ProductDetailPageRoutingModule } from './product-detail-routing.module';
import { ProductDetailPage } from './product-detail.page';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    IonicModule,
    ProductDetailPageRoutingModule
  ],
  declarations: [ProductDetailPage]
})
export class ProductDetailPageModule {}
