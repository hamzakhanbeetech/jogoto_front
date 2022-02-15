import {Pipe,PipeTransform} from '@angular/core'
import {UtilitesService} from '../services';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
    constructor(private _utilitesService: UtilitesService) {
    }

    transform(val: string): string {
        if (val && val.length > 150) {
            const string = val.slice(0, val.substring(0, 150).lastIndexOf(' ')) + ' ...';
            return this._utilitesService.checkHashtags(string);
        } else {
            return this._utilitesService.checkHashtags(val);
        }
    }
}
