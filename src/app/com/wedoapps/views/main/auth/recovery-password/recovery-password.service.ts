import {Injectable} from '@angular/core';
import {ApiService, TransformErrorService} from '../../../../services';
import {Observable, throwError} from 'rxjs';
import {ServerResponse} from '../../../../models/global.models';
import {catchError} from 'rxjs/operators';

@Injectable()
export class RecoveryPasswordService {

  constructor(private _apiService: ApiService,
              private _transformErrorService: TransformErrorService) {
  }

  public usersResetPassword(hash): Observable<ServerResponse<any>> {
    const url = `users/reset-password/${hash}`;
    return this._apiService.get(url, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public recoverPassword(sendingData): Observable<ServerResponse<{}>> {
    const url = `users/save-password`;
    return this._apiService.put(url, sendingData, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

}
