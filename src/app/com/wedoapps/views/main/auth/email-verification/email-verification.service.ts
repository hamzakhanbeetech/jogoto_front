import {Injectable} from '@angular/core';
import {ApiService, TransformErrorService} from '../../../../services';
import {Observable, throwError} from 'rxjs';
import {ServerResponse, UserModel} from '../../../../models/global.models';
import {catchError} from 'rxjs/operators';

@Injectable()
export class EmailVerificationService {

  constructor(private _apiService: ApiService,
              private _transformErrorService: TransformErrorService) {
  }

  public verifyEmail(hashCode: string): Observable<ServerResponse<UserModel>> {
    return this._apiService.get(`users/verify-email/${hashCode}`, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }
}
