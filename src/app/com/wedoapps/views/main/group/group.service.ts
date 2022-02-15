import {Injectable} from '@angular/core';
import {ApiService, TransformErrorService} from '../../../services';
import {Observable, throwError} from 'rxjs';
import {EventModel, GroupModel, MemberModel, ServerResponse, UserModel} from '../../../models/global.models';
import {CookieService} from 'ngx-cookie';
import {UsersFileModel} from '../basic/create-group/create-group.models';
import {catchError} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class GroupService {

  constructor(private _apiService: ApiService,
              private _cookieService: CookieService,
              private _transformErrorService: TransformErrorService) {
  }

  public getGroupById(id: string,
                      userLimit: number = 5,
                      userSkip: number = 0,
                      eventLimit: number = 5,
                      eventSkip: number = 0): Observable<ServerResponse<GroupModel>> {
    const u_id = this._cookieService.get('user_id') || '';
    const url = `group/by/${id}?u_id=${u_id}`;
    return this._apiService.get(url, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public makeModerator(u_id: string,
                       u_token: string,
                       groupId: string,
                       userId: string): Observable<ServerResponse<GroupModel>> {
    const url = `group/add-moderator?u_id=${u_id}`;
    return this._apiService.put(url, {
      'group_id': groupId,
      'user_id': userId
    }, true, false, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      }));
  }

  public makeAdmin(u_id: string,
                   u_token: string,
                   groupId: string,
                   userId: string): Observable<ServerResponse<GroupModel>> {
    const url = `group/add-admin?u_id=${u_id}`;
    return this._apiService.put(url, {
      'group_id': groupId,
      'user_id': userId
    }, true, false, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      }));
  }

  public makeMember(u_id: string, userId: string, groupId: string): Observable<ServerResponse<GroupModel>> {
    const url = `group/delete-moderator?u_id=${u_id}&user_id=${userId}&group_id=${groupId}`;
    return this._apiService.delete(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public removeMember(u_id: string,
                      userId: string,
                      groupId: string): Observable<ServerResponse<GroupModel>> {
    const url = `group/delete?u_id=${u_id}&group_id=${groupId}&user_id=${userId}`;
    return this._apiService.delete(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }


  public sendFile(groupId: string, data: UsersFileModel, type: string): Observable<ServerResponse<GroupModel>> {
    type == 'event' ? type = 'events/invite-by-file' : type = 'group/add-file';
    const u_id = this._cookieService.get('user_id') || '',
      url = `${type}?u_id=${u_id}`;
    return this._apiService.put(url, {
      'id': groupId,
      'file_data': {
        'extname': data.extname,
        'data': data.data
      }
    }, true, false, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      }));
  }

  public followUser(u_id: string,
                    u_token: string,
                    id: string): Observable<ServerResponse<GroupModel>> {
    const url = `users/follow/${id}?u_id=${u_id}`;
    return this._apiService.put(url, {}, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public followOrJoinGroup(groupId, u_id): Observable<ServerResponse<GroupModel>> {
    const url = `group/join-follow-group?u_id=${u_id}`;
    return this._apiService.put(url, {
      'group_id': groupId
    }, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public getGroupUsers(offset: number, limit: number, groupId: string): Observable<ServerResponse<MemberModel[]>> {
    const u_id = this._cookieService.get('user_id') || '';
    const url = `group/users/${groupId}?u_id=${u_id}&skip=${offset}&limit=${limit}`;
    return this._apiService.get(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public getGroupEvents(offset: number, limit: number, groupId: string): Observable<ServerResponse<EventModel[]>> {
    const u_id = this._cookieService.get('user_id') || '';
    const url = `events/group/${groupId}?u_id=${u_id}&skip=${offset}&limit=${limit}`;
    return this._apiService.get(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public getGroupCalendarEvents(offset: number, limit: number, groupId: string, query: string): Observable<ServerResponse<EventModel[]>> {
    const u_id = this._cookieService.get('user_id') || '';
    const url = `group/get-group-events/${groupId}?u_id=${u_id}&skip=${offset}&limit=${limit}${query}`;
    return this._apiService.get(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

// group past and upcoming events
  public getGroupPastUpcomingEvents(offset: number, limit: number, groupId: string, type: string): Observable<ServerResponse<EventModel[]>> {
    const u_id = this._cookieService.get('user_id') || '';
    const url = `group/${type}/${groupId}?u_id=${u_id}&skip=${offset}&limit=${limit}`;
    return this._apiService.get(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public deleteUserFromGroup(u_id: string, user_id: string, groupId: string): Observable<ServerResponse<any>> {
    const url = `group/delete?u_id=${u_id}&user_id=${user_id}&group_id=${groupId}`;
    return this._apiService.delete(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public searchGroupUsers(data: string, groupId: string, skip: number, limit: number): Observable<ServerResponse<UserModel[]>> {
    const url = `group/search-group-users?group_id=${groupId}&query=${data}&skip=${skip}&limit=${limit}`;
      return this._apiService.get(url, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }
}
