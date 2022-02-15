import {Injectable} from '@angular/core';
import {ApiService, TransformErrorService} from '../../../../services';
import {Observable, throwError} from 'rxjs';
import {DatasForLogin, LoginDataModel} from './login.models';
import {ServerResponse} from '../../../../models/global.models';
import {catchError} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class LoginService {

  constructor(private _apiService: ApiService,
              private _transformErrorService: TransformErrorService) {
  }

  public userLogin(email: string, password: string, deviceSets:any, lang: string, socialData?:any): Observable<ServerResponse<LoginDataModel>> {
    const url: string = `users/login`;
    const loginUserData: DatasForLogin = {
      email,
      password,
      device:deviceSets.device,
      os:deviceSets.os,
      lang,
        ...socialData
    };
      return this._apiService.post(url, loginUserData, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }
}
