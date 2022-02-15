import {Injectable} from '@angular/core';

@Injectable()
export class AppService {
  private _isAuthorized: boolean = false;

  constructor() {
  }

  public setIsAuthorized(isAuthorized: boolean): void {
    this._isAuthorized = isAuthorized;
  }

  public getIsAuthorized(): boolean {
    return this._isAuthorized;
  }

}
