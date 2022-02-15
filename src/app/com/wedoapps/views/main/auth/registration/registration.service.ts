import {Injectable} from '@angular/core';
import {ApiService, TransformErrorService} from '../../../../services';
import {Observable, throwError} from 'rxjs';
import {ServerResponse, UserDataModel} from '../../../../models';
import {BusinessTypesModel, SocialUser} from './registration.models';
import {catchError} from 'rxjs/operators';

@Injectable({providedIn: 'root'})

export class RegistrationService {

  constructor(private _apiService: ApiService,
              private _transformErrorService: TransformErrorService) {
  }

  public individualRegistration(datasOfRegister): Observable<ServerResponse<UserDataModel>> {
    const url: string = `users`;
    return this._apiService.post(url, datasOfRegister, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public professionalRegistration(datasOfRegister): Observable<ServerResponse<UserDataModel>> {
    const url: string = `users/professional`;
    return this._apiService.post(url, datasOfRegister, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getBusinessTypes(): Observable<ServerResponse<BusinessTypesModel>> {
    const url: string = `users/get-buisness-types`;
    return this._apiService.get(url, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public signInSocial(datasOfRegister: SocialUser, type: string): Observable<ServerResponse<UserDataModel>> {
    const url: string = `users/${type}`;
    return this._apiService.post(url, datasOfRegister, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }
}
