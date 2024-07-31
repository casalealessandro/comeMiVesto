import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fotoOutfit'
})
export class FotoOutfitPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
