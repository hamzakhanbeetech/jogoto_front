import {Injectable} from '@angular/core';
import {ApiService, TransformErrorService} from '../../../../services';
import {Observable, throwError} from 'rxjs';
import {ServerResponse} from '../../../../models';
import {catchError} from 'rxjs/operators';

@Injectable()
export class EventsService {

  constructor(private _apiService: ApiService,
              private  _transformErrorService: TransformErrorService) {
  }

  public getUserInterestedEvents(id: string, filter: string, type: string, skip: number, limit: number): Observable<ServerResponse<any>> {
    filter = !filter ? 'incoming': filter;
    return this._apiService.get(`events/user/${id}?type=${type}&filter=${filter}&skip=${skip}&limit=${limit}`, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

  public searchUserEvents(id: string, filter: string, type: string, name: string, skip: number, limit: number): Observable<ServerResponse<any>> {
    return this._apiService.get(`events/user-search/${id}?type=${type}&filter=${filter}&skip=${skip}&limit=${limit}&name=${name}`, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }
}
