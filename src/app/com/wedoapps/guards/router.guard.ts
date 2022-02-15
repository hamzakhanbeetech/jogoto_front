import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {map} from "rxjs/operators";
const allowedLanguages = ['en', 'fr', ''];



@Injectable()
export class RouterGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return next.params && allowedLanguages.includes(next.params['ln'])
        ? true
        : this.router.navigate([''])
  }

}
