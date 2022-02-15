import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {CookieService} from 'ngx-cookie';
import {HttpClient} from '@angular/common/http';
import {catchError} from 'rxjs/operators';

import {ApiService, TransformErrorService} from '../../../../services';
import {GroupModel, ServerResponse, UserModel} from '../../../../models/global.models';
import {CreateGroupModel} from './create-group.models';

@Injectable()
export class CreateGroupService {

  constructor(
    private _apiService: ApiService,
    private _cookieService: CookieService,
    private _httpClient: HttpClient,
    private _transformErrorService: TransformErrorService
  ) {
  }

  private _userId = this._cookieService.get('user_id');

  public getGroupById(data): Observable<ServerResponse<GroupModel>> {
    return this._apiService.get(`group/creator/${data.id}?u_id=${data.u_id}`, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

  public createGroup(data: CreateGroupModel, isEdit: boolean = false, groupId: string = ''): Observable<ServerResponse<GroupModel>> {
      if (isEdit) {
      data.group_id = groupId;
      return this._apiService.put(`group/update?u_id=${this._userId}`, data, true, true, true)
        .pipe(
          catchError((err) => {
            /* transform error message by status code */
            const transformedError = this._transformErrorService.transformError(err);
            return throwError(transformedError);
          })
        );
    } else {
      return this._apiService.post(`group?u_id=${this._userId}`, data, true, true, true)
        .pipe(
          catchError((err) => {
            /* transform error message by status code */
            const transformedError = this._transformErrorService.transformError(err);
            return throwError(transformedError);
          })
        );
    }
  }

  public getUsers(name: string, limit: number): Observable<ServerResponse<UserModel[]>> {
    return this._apiService.get(`users/search?query=${name}&limit=${limit}&u_id=${this._userId}`,
      true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

  public getImage(url: string): Observable<Blob> {
    return this._httpClient.get(url, {responseType: 'blob'})
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

  public searchUsers(name: string): Observable<any> {
    if (name === '' || name.length < 2) {
      return of([]);
    }
    let result = new Observable((observer) => {
      this.getUsers(name, 5)
        .subscribe((value: ServerResponse<UserModel[]>) => {
          if (value.data.length) {
            let data = value.data;
            data = data.filter((user: UserModel) => {
              return user._id !== this._userId;
            });
            observer.next(data);
            observer.complete();
          } else {
            observer.next([]);
            observer.complete();
          }

        });
    });
    return result;
  }

  public publishGroup(groupId): Observable<any> {
    return this._apiService.put(`group/update-type/${groupId}`, {'visibility': 'published'}, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }
}
