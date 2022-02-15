import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppService } from '../../../app.service';


@Injectable()
export class AuthModuleGuard implements CanActivate {

    constructor(private _appService: AppService, private _router: Router) { }

    canActivate(): boolean {
        if (this._appService.getIsAuthorized()) {
          this._router.navigate(['']);
            return false;
        }
        else {
            return true;
        }
    }
}
