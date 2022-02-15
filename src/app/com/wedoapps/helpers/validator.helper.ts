import * as moment from 'moment';
import {FormControl} from '@angular/forms';

export class ValidatorHelper {
  static DateValidator(format = 'MM/dd/YYYY'): any {
    return (control: FormControl): { [key: string]: any } => {
      const date = moment(control.value, format, true);

      if (!date.isValid()) {
        return {invalidDate: true};
      }

      return null;
    };
  }
  static readonly EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  static readonly ICON_REGEXP = /\/([\w-]*)\.svg$/i;
  static readonly IMAGE_REGEXP = /\/([\w-]*)\.\w+$/i;
  static readonly NAME_REGEXP = /^[^!¡?÷?¿\\+=@#$%ˆ&*(){}|`~<>;:,.\/[\]]{2,}/u;
}
