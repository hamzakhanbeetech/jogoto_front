import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppService } from '../../../app.service';


@Injectable()
export class MergeAccountsGuard implements CanActivate {

    constructor(private _appService: AppService, private _router: Router) { }

    canActivate(): boolean {
        if (localStorage.getItem('social_user_data')) {
            return true;
        }
        else {
            this._router.navigate(['']);
            return false;
        }
    }
}
