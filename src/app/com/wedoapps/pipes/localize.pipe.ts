import {Pipe, PipeTransform} from '@angular/core';
import {UtilitesService} from "../services";
import {Router} from "@angular/router";

@Pipe({
  name: 'localize',
  pure: false
})
export class LocalizePipe implements PipeTransform {
constructor(private utilitesService: UtilitesService, private route: Router) {
}
  transform(url): any {
    return  this.utilitesService.localizeRouter(url);
  }

}
