import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'largeNumbers'
})
export class LargeNumbersPipe implements PipeTransform {

  transform(number: any, args?: any): any {
      const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
      const tier = Math.log10(number) / 3 | 0;

      if(tier == 0) return number;

      const suffix = SI_SYMBOL[tier];
      const scale = Math.pow(10, tier * 3);
      const scaled = number / scale;

      // format number and add suffix
      return scaled.toFixed(1) + suffix;
  }

}
