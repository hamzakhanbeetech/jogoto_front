import {Injectable} from '@angular/core';
import {ApiService, TransformErrorService} from '../../../../services';
import {Observable, throwError} from 'rxjs';
import {SendingDatasForForgot} from './forgot.models';
import {ServerResponse} from '../../../../models/global.models';
import {LoginDataModel} from '../login/login.models';
import {catchError} from 'rxjs/operators';


@Injectable()
export class ForgotService {

  constructor(private _apiService: ApiService,
              private _transformErrorService: TransformErrorService) {
  }

  public forgotPassword(sendingData): Observable<ServerResponse<{}>> {
    const url = `users/recover-password`;
    return this._apiService.put(url, sendingData, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public resendPassword(sendingData): Observable<ServerResponse<{}>> {
    const url = `users/send-new-verify-link`;
    return this._apiService.put(url, sendingData, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

}
