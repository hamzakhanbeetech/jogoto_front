import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';

import {ApiService, TransformErrorService} from '../../services';
import {CategoryModel, FiltersModel, ServerResponse, UserModel} from '../../models/global.models';
import {HttpParams} from '@angular/common/http';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(private _apiService: ApiService,
              private _transformErrorService: TransformErrorService) {
  }

  public getCategoriesList(): Observable<ServerResponse<Array<CategoryModel>>> {
    const url = `events/category`;
    return this._apiService.get(url, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

  public getFiltersList(): Observable<ServerResponse<FiltersModel>> {
    const url = `filters`;
    return this._apiService.get(url, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

  public getUsersLogOut(): Observable<ServerResponse<{}>> {
    const url = `users/logout`;
    return this._apiService.get(url, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

  // put follow user api
  public followUser(data): Observable<ServerResponse<Array<UserModel>>> {
    const url = `users/`;
    return this._apiService.put(`${url}follow/${data.id}?u_id=${data.u_id}`, {}, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

  // unfollow user
  public unfolowUser(data): Observable<ServerResponse<Array<UserModel>>> {
    const url = `users/`;
    return this._apiService.delete(`${url}unfollow/${data.id}?u_id=${data.u_id}`, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }
}
