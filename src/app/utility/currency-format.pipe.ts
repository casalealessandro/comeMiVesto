import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
 
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(value: number | undefined, currencyCode: string = 'EUR', display: 'symbol' | 'narrowSymbol' | 'code' = 'symbol', digitsInfo: string = '1.0-2'): string | null {
    
    if(typeof value  == 'undefined') {
      return null
    }
    
    if (value == null) {
      return null;
    }

    const numberFormat = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return numberFormat.format(value);
  }
}
