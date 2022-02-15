import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {CookieService} from 'ngx-cookie';
import {HttpClient} from '@angular/common/http';
import {catchError} from 'rxjs/operators';

import {CreateEventModel} from './create-event.models';
import {ApiService, TransformErrorService} from '../../../../services';
import {GroupModel, ServerResponse} from '../../../../models/global.models';

@Injectable()
export class CreateEventService {

  constructor(
    private _apiService: ApiService,
    private _cookieService: CookieService,
    private _httpClient: HttpClient,
    private _transformErrorService: TransformErrorService
  ) {
  }

  public createEvent(body: CreateEventModel): Observable<any> {
      return this._apiService.post(`events?u_id=${this._cookieService.get('user_id')}`, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getMyEvents(gap: { limit: number, skip: number } = {limit: 100, skip: 0}, type?:string): Observable<any> {
    let requestUrl = `events/my?u_id=${this._cookieService.get('user_id')}&limit=${gap.limit}&skip=${gap.skip}`;
    if(type){
        requestUrl += `&type=${type}`
    }

      return this._apiService.get(requestUrl, true, false, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getMyEventByQuerry(gap: { limit: number, skip: number }, query: string, type?:string): Observable<any> {
    let requestUrl = `events/search-my-events?u_id=${this._cookieService.get('user_id')}&limit=${gap.limit}&skip=${gap.skip}&query=${query}`;
    if(type){
        requestUrl += `&type=${type}`
    }

    return this._apiService.get(requestUrl, true, false, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getMyEventByFilter(gap: { limit: number, skip: number }, params: string = ''): Observable<any> {
    const requestUrl = `events/search-calendar-events?u_id=${this._cookieService.get('user_id')}&limit=${gap.limit}&skip=${gap.skip}${params}`;
    return this._apiService.get(requestUrl, true, false, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getMyEventByDateFilter(gap: { limit: number, skip: number }, params: string = ''): Observable<any> {
    const requestUrl = `events/search-calendar-events-mobile?u_id=${this._cookieService.get('user_id')}&limit=${gap.limit}&skip=${gap.skip}${params}`;
      return this._apiService.get(requestUrl, true, false, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getMyCalendarEvents(gap: { limit: number, skip: number } = {limit: 100, skip: 0}, type?:string): Observable<any> {
    let requestUrl = `events/my-calendar-events?u_id=${this._cookieService.get('user_id')}&limit=${gap.limit}&skip=${gap.skip}`;
    if(type){
      requestUrl += `&type=${type}`
    }

    return this._apiService.get(requestUrl, true, false, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getImage(url: string): Observable<Blob> {
    // console.log('test', url)
    url = url.replace('original', 'cropped')
    return this._httpClient.get(url, {responseType: 'blob'}).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getEventById(id: string): Observable<any> {
    return this._apiService.get(`events/${id}?u_id=${this._cookieService.get('user_id')}`, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateEventById(body: CreateEventModel, id: string): Observable<any> {
      return this._apiService.put(`events/${id}?u_id=${this._cookieService.get('user_id')}`, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUserGroups(): Observable<any> {
    const userId = this._cookieService.get('user_id');
    return this._apiService.get(`group/user-groups/${userId}?u_id=${userId}`, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public exportCalendar(): Observable<any> {
    return this._apiService.get(`users/export-calendar`, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public removeCalendarEvent(id: string): Observable<any> {
    return this._apiService.delete(`users/calendar-event?u_id=${this._cookieService.get('user_id')}`, true, true, true,null,null, null, {"id":id}).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getGroupById(groupId: string): Observable<ServerResponse<GroupModel>> {
    const u_id = this._cookieService.get('user_id') || '';
    const url = `group/by/${groupId}?u_id=${u_id}`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public publishEvent(eventId, data): Observable<any> {
    return this._apiService.put(`events/update-type/${eventId}`, data, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getTimezones(): Observable<any> {
    return this._apiService.get('get-timezones', true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

}
