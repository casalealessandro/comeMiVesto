import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';



import { FotoOutfitPage } from './foto-outfit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    
  ],
  declarations: [FotoOutfitPage],
  exports: [
    FotoOutfitPage // Esporta il componente se deve essere usato in altri moduli
  ]
})
export class FotoOutfitPageModule {}
