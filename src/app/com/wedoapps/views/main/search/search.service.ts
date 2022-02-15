import {Injectable} from '@angular/core';

import {ServerResponse, UserModel} from '../../../models/global.models';
import {GroupModel} from '../initial/initial.models';
import {ApiService, TransformErrorService} from '../../../services';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class SearchService {

  constructor(private _apiService: ApiService,
              private _transformErrorService: TransformErrorService) {
  }

  public getEventSearchingDatas(isAuthorized: boolean, skip: number, limit: number, popular: boolean, id, searchData, filtrDate): Observable<any> {
    let url;
    isAuthorized ? url = `events/search?id=${id}&` : url = `events/find?`;
    Object.keys(searchData).forEach((el: string) => {
      if (searchData && searchData[el]) {
        url += `${el}=${searchData[el]}&`;
      }
    });
    url += `skip=${skip}&limit=${limit}&popular=${popular}&filtrDate=${filtrDate}`;
    url = url.replace('#', '%23');

    return this._apiService.get(url, true, isAuthorized, isAuthorized)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

// /events/suggested-events
  public getSuggestedEventsSearching(isAuthorized: boolean, skip: number, limit: number, id, searchData, ids): Observable<any> {
    let url = `events/suggested-events?skip=${skip}&limit=${limit}`;
      Object.keys(searchData).forEach((el: string) => {
          if (searchData && searchData[el]) {
              url += `${el}=${searchData[el]}&`;
          }
      });
    return this._apiService.post(url, ids,true, isAuthorized, isAuthorized)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public searchGroups(groupname: string, skip: number, limit: number): Observable<ServerResponse<GroupModel[]>> {
    let body = new URLSearchParams();
    return this._apiService.get(`group/search?name=${groupname || ''}&skip=${skip}&limit=${limit}`, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public searchUsers(username: string, userType: string, skip: number, limit: number, isOrgan: boolean = false, organId?: string): Observable<ServerResponse<UserModel[]>> {
    let url = `users/search?search_type=page&query=${username || ''}&type=${userType}&skip=${skip}&limit=${limit}`;
    if (isOrgan) {
      url = `users/search-for-page?query=${username || ''}&skip=${skip}&limit=${limit}&page_id=${organId}`;
    }

    return this._apiService.get(url, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public searchModerators(q: string, skip: number, limit: number, userId: string): Observable<ServerResponse<UserModel[]>> {
    return this._apiService.get(`users/search-page-users?query=${q || ''}&skip=${skip}&limit=${limit}&id=${userId}`, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }
}
