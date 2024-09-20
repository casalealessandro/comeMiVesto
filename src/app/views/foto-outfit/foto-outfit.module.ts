import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';



import { FotoOutfitPage } from './foto-outfit.page';
import { CurrencyFormatPipe } from "../../utility/currency-format.pipe";
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule
],
  declarations: [FotoOutfitPage],
  exports: [
    FotoOutfitPage,
    
     // Esporta il componente se deve essere usato in altri moduli
  ]
})
export class FotoOutfitPageModule {}
