import {Injectable} from '@angular/core';

import {ApiService, TransformErrorService} from '../../../services';
import {Observable, throwError} from 'rxjs';
import {
  EventModel,
  ServerResponse,
  ReportEventSendingDataModel,
  AddEventToGroupModel,
  InviteByEmails,
  InviteUsers
} from '../../../models';
import {catchError} from 'rxjs/operators';


@Injectable({providedIn: 'root'})
export class EventService {

  constructor(private _apiService: ApiService,
              private _transformErrorService: TransformErrorService) {
  }

  public getEvent(data): Observable<ServerResponse<EventModel>> {
    let headers = new Headers({user_token: data.user_token, u_id: data.u_id});
    return this._apiService.get(`events/${data.id}?u_id=${data.u_id}`, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public getSimilarEvents(data): Observable<ServerResponse<any>> {
    return this._apiService.get(`events/similar-events/${data.id}?limit=${data.limit}&skip=${data.skip}`, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public unJoinToEvent(event_id: string, reasonText: string): Observable<ServerResponse<any>> {
    const body = {event_id: event_id, text: reasonText};
    const url = `users/event/unjoin`;
    return this._apiService.put(url, body, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public joinToEvent(event_id: string, dates?: Array<string>): Observable<ServerResponse<any>> {
    const body = {event_id: event_id, dates: dates};
    const url = `users/event/join`;
    return this._apiService.put(url, body, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public notificationSettings(event_id: string, notificationType: string) {
    const body = {event_id: event_id, notification_type: notificationType};
    const url = `users/event/notify`;
    return this._apiService.put(url, body, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public addEventToFavorites(event_id: string) {
    const body = {id: event_id};
    const url = `users/favorites`;
    return this._apiService.put(url, body, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public removeEventFromFavorites(event_id: string, user_id: string) {
    const url = `users/favorites/${event_id}?u_id=${user_id}`;
    return this._apiService.delete(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public reportEvent(sendingData: ReportEventSendingDataModel) {
    const url = `events/report-event`;
    return this._apiService.post(url, sendingData, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public getSuggestedGroups(data) {
    const url = `group/get-groups-add-to-group-popup?u_id=${data.u_id}&limit=${data.limit}&skip=${data.skip}&lat=${data.lat}&lon=${data.lon}&event_id=${data.event_id}`;
    return this._apiService.get(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public addEventToGroup(event_id: string, group_id: string, user_id: string) {
    const body: AddEventToGroupModel = {
      group_id: group_id,
      event_id: event_id
    };
    const url = `group/add-event?u_id=${user_id}`;
    return this._apiService.put(url, body, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));

  }

  public searchGroupByGroupName(nameOfGroup: string, user_id: string, limit: number, skip: number, eventId: string) {
    const url = `group/search/?name=${nameOfGroup}&u_id=${user_id}&limit=${limit}&skip=${skip}&event_id=${eventId}`;
    return this._apiService.get(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public getFollowersListOfUser(userId: string, event_id: string, limit: number, skip: number, isGroup: boolean) {
    let url = `users/follow/list-popup?u_id=${userId}&limit=${limit}&skip=${skip}`;
    if (isGroup) {
      url += `&group_id=${event_id}`;
    } else {
      url += `&event_id=${event_id}`;
    }
    return this._apiService.get(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public searchUsersForInviting(userId: string, query: string, limit: number, skip: number, event_id: string, isGroup: boolean = false) {
    let url = `users/search-for-event?u_id=${userId}&limit=${limit}&skip=${skip}&query=${query}&event_id=${event_id}`;
    if (isGroup) {
      url = `users/search-for-group?u_id=${userId}&limit=${limit}&skip=${skip}&query=${query}&group_id=${event_id}`;
    }
    return this._apiService.get(url, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public inviteByEmailAddresses(userId: string, data: any, emails: Array<string>) {
    let url = `users/event/invite-by-emails?u_id=${userId}`;
    let body: InviteByEmails = {
      event_id: data.id,
      emails: emails
    };

    if (data.type) {
      url = `users/group/invite-by-emails?u_id=${userId}`;
      body = {
        group_id: data.id,
        emails: emails
      };
    }

    return this._apiService.put(url, body, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public inviteUsers(userId: string, data: any, selectedUsers: Array<string>) {
    let url = `users/event/invite-users?u_id=${userId}`;
    let body: InviteUsers = {
      event_id: data.id,
      users: selectedUsers
    };

    if (data.type) {
      url = `users/group/invite-users?u_id=${userId}`;
      body = {
        event_id: '',
        group_id: data.id,
        users: selectedUsers
      };
    }

    return this._apiService.put(url, body, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public joinAndAddEventToGroup(userId: string, groupId: string, eventId: string) {
    const url = `group/join-and-add-event-group?u_id=${userId}`;
    const body = {
      group_id: groupId,
      event_id: eventId
    };
    return this._apiService.put(url, body, true, false, true);
  }

  public followGroup(userId: string, groupId: string) {
    const url = `group/join-follow-group?u_id=${userId}`;
    const body = {
      group_id: groupId
    };
    return this._apiService.put(url, body, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public setGroupNotificationSettings(groupId: string, Notification: string): Observable<ServerResponse<{}>> {
    const url = `users/group/notify-group`;
    return this._apiService.put(url, {
      'group_id': groupId,
      'notification_type': Notification
    }, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

// update event views
  public updateEventViews(eventId: string, body) {
    const url = `events/update-views?event_id=${eventId}`;
    return this._apiService.put(url, body, true, false, false)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

  public translateEventDescription(body) {
    const url = `translate-event`;
    return this._apiService.put(url, body, true, false, false)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

}
