import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

import {UserTypeConstants} from '../constants/user.constants';
import {AppService} from '../../../app.service';
import {UtilitesService} from "../services";

@Injectable()
export class UserIndividualGuard implements CanActivate {

  constructor(private _appService: AppService, private _router: Router, private utilitesService: UtilitesService) {
  }

  canActivate(): boolean {
    const userType = JSON.parse(localStorage.getItem('user_data'));

    if (!!userType) {
      if (UserTypeConstants.INDIVIDUAL === userType.register_type) {
        const localisedUrl = this.utilitesService.localizeRouter('/user');
        this._router.navigate([localisedUrl]);
        return false;
      }

      return true;
    }

    this._router.navigate(['']);
    return false;
  }
}
