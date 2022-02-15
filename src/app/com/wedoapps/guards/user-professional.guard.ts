import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

import {UserTypeConstants} from '../constants/user.constants';
import {AppService} from '../../../app.service';
import {UtilitesService} from "../services";


@Injectable()
export class UserProfessionalGuard implements CanActivate {

  constructor(private _appService: AppService, private _router: Router, private utilitesService: UtilitesService) {
  }

  canActivate(): boolean {
    const userType = JSON.parse(localStorage.getItem('user_data'));

    if (!!userType) {
      if (UserTypeConstants.PROFESSIONAL === userType.register_type) {
        const localisedUrl = this.utilitesService.localizeRouter('/organization');
        this._router.navigate([localisedUrl]);
        return false;
      }

      return true;
    }

    this._router.navigate(['']);
    return false;
  }
}
