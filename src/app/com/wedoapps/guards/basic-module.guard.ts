import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AppService } from '../../../app.service';
import {UtilitesService} from "../services";

@Injectable()
export class BasicModuleGuard implements CanActivate {

    constructor(private _appService: AppService, private _router: Router, private utilitesService: UtilitesService) { }

    canActivate(): boolean | Observable<boolean> | Promise<boolean> {
        if (this._appService.getIsAuthorized()) {
            return true;
        }
        else {
          const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
          this._router.navigate([localisedUrl]);
            return false;
        }
    }
}
