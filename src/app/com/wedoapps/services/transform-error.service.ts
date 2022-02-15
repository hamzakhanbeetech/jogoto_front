import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SendInfoToAlertMessage} from '../models/global.models';
import {SubjectsInteractionsService} from './subjects-interactions.service';
import {Router} from '@angular/router';

@Injectable()
export class TransformErrorService {
  public alertData: SendInfoToAlertMessage = {
    type: 'error',
    messageText: '',
    display: true
  };
  public error: any = {
    messageText: '',
    show: true
  };

  constructor(private _translate: TranslateService,
              private _subjectsIteractionsService: SubjectsInteractionsService,
              private _router: Router) {

  }

  public transformError(err) {
    this._translate.get(['delete_error', 'check_connection']).subscribe((translated: any) => {
      this.alertData.messageText = translated.check_connection;
      this.error.messageText = translated.delete_error;
    });
    const connected = navigator.onLine;

    if (!connected) {
      window.scrollTo(0, 0);
      this._subjectsIteractionsService.errorSuccessMessag.next(this.alertData);
      return true;
    } else if (connected && err.status === 500) {
      if (this._router.url.match('/auth/' || '/basic/create-' || 'contact-us')) {
        return this.error;
      } else {
        window.scrollTo(0, 0);
        this.alertData.messageText = this.error.messageText;
        this._subjectsIteractionsService.errorSuccessMessag.next(this.alertData);
        return true;
      }
    }
    console.log(err);
    return err;
  }
}
