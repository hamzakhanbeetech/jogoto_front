import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {ApiService, UtilitesService} from '../services';
import {Location} from "@angular/common";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private _apiService: ApiService, private router:Router, private utilitesService: UtilitesService, private location: Location, private translate: TranslateService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
      return this._apiService.checkToken();
    }
}
