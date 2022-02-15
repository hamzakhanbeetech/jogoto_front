import {Injectable} from '@angular/core';
import {ApiService, TransformErrorService} from '../../../services';
import {Observable, throwError} from 'rxjs';
import {ServerResponse, EventModel} from '../../../models/global.models';
import {GroupModel} from './initial.models';
import {CookieService} from 'ngx-cookie';
import {catchError} from 'rxjs/operators';

@Injectable()
export class InitialService {

  constructor(private _apiService: ApiService, private _cookieService: CookieService,
              private _transformErrorService: TransformErrorService) {
  }

  public getSuggestedGroups(limit: number, skip: number, lat: number, lot: number, isAuthorized: boolean, groupId: string = '', userId: string = ''): Observable<ServerResponse<GroupModel[]>> {
    let url = `group/suggested?limit=${limit}&skip=${skip}&id=${groupId}&u_id=${userId}`;
    if (lat && lot) {
      url += `&lat=${lat}&lon=${lot}`;
    }
    return this._apiService.get(url, true, false, isAuthorized)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public joinToEvent(event_id: string): Observable<ServerResponse<any>> {
    const body = {event_id: event_id};
    const url = `users/event/join`;
    return this._apiService.put(url, body, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public joinToGroup(group_id: string): Observable<ServerResponse<any>> {
    const u_id: string = this._cookieService.get('user_id') || '';
    const url = `group/join-follow-group`;
    const body = {
      group_id: group_id,
      users: [u_id]
    };
    return this._apiService.put(url, body, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public leaveFromGroup(group_id: string) {
    const u_id: string = this._cookieService.get('user_id') || '';
    const url = `group/delete?group_id=${group_id}&u_id=${u_id}&user_id=${u_id}`;
    return this._apiService.delete(url, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public getEventsNearYou(limit: number, lat: number, lon: number, isAuthorized: boolean) {
    let url: string = `events/events-near-you?limit=${limit}`;
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    }
    return this._apiService.get(url, true, isAuthorized, isAuthorized)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

    public getIncomingEvent(url: string): Observable<ServerResponse<EventModel[]>> {
        // const url: string = `events/incoming-events`;
        return this._apiService.get(url, true, true, true)
            .pipe(
                catchError((err) => {
                    /* transform error message by status code */
                    const transformedError = this._transformErrorService.transformError(err);
                    return throwError(transformedError);
                }));
    }

}
