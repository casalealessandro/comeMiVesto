import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyFormatPipe } from 'src/app/utility/currency-format.pipe';



@NgModule({
  declarations: [CurrencyFormatPipe],
  imports: [
    CommonModule,
    
  ],
  exports:[CurrencyFormatPipe,CommonModule,]
})
export class SharedModule { }
