import {Injectable} from '@angular/core';
import {from, Observable, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';

import {ApiService} from './api.service';
import {catchError} from 'rxjs/operators';
import {TransformErrorService} from './transform-error.service';
import {EventModel, ServerResponse, UserModel, PasswordModel, SocialLinksModel} from '../models';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';


@Injectable()
export class UserService {

  constructor(private _apiService: ApiService,
              private _http: HttpClient,
              public afAuth: AngularFireAuth,
              private _transformErrorService: TransformErrorService) {
  }


  public TwitterAuth(): any {
    return this.AuthLogin(new auth.TwitterAuthProvider());
  }

  // Auth logic to run auth providers
  public AuthLogin(provider): Observable<any> {
    return from(this.afAuth.auth.signInWithPopup(provider));
    // .then((result) => {
    //     console.log(result);
    //     console.log('You have been successfully logged in!')
    // }).catch((error) => {
    //     console.log(error)
    // })
  }

  public getUserByUserId(user_id: string): Observable<ServerResponse<UserModel>> {
    const url = `users/${user_id}`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUsersProfilesByUserId(user_id: string): Observable<ServerResponse<UserModel>> {
    const url = `users/profile/${user_id}`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateUserInfo(body: any, type: string = 'update'): Observable<ServerResponse<UserModel>> {
    const url = `users/${type}`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateUserCategories(body: any): Observable<ServerResponse<any>> {
    const url = `users/category/mobile`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateUserCats(body: any): Observable<ServerResponse<UserModel>> {
    const url = `users/update-page-cats`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateUserProfileImage(body: any): Observable<ServerResponse<any>> {
    const url = `users/update-image`;
    return this._apiService.put(url, {poster: body}, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public followToUser(userId: string): Observable<ServerResponse<UserModel>> {
    const url = `users/follow/${userId}`;
    return this._apiService.put(url, {}, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public unfollowFromUser(userId: string): Observable<ServerResponse<UserModel>> {
    const url = `users/unfollow/${userId}`;
    return this._apiService.delete(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public addNewModerator(body: any): Observable<ServerResponse<UserModel>> {
    const url = `users/add-page-moderators`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public deleteModerator(moderatorId: string): Observable<ServerResponse<UserModel>> {
    const url = `users/delete-page-moderator/${moderatorId}`;
    return this._apiService.delete(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateCategoriesOfUser(body: any): Observable<ServerResponse<any>> {
    const url = `users/category`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUserFollowersList(userId: string, query: string = '', skip: number, limit: number): Observable<ServerResponse<UserModel[]>> {
    return this._apiService.get(`users/follow/list?id=${userId}&query=${query}&skip=${skip}&limit=${limit}`, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getOrganizationFollowersList(userId: string, query: string = '', skip: number, limit: number): Observable<ServerResponse<UserModel[]>> {
    return this._apiService.get(`users/follow/list-page-popup?page_id=${userId}&query=${query}&skip=${skip}&limit=${limit}`, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUserFollowingsList(userId: string, query: string = '', skip: number, limit: number): Observable<ServerResponse<UserModel[]>> {
    return this._apiService.get(`users/following/list?id=${userId}&query=${query}&skip=${skip}&limit=${limit}`, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUserInvitationsList(skip: number, limit: number): Observable<ServerResponse<any>> {
    const url = `users/invite/list?skip=${skip}&limit=${limit}`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUserGroupInvitationsList(skip: number, limit: number): Observable<ServerResponse<any>> {
    const url = `users/invite/group-list?skip=${skip}&limit=${limit}`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUserPageInvitationsList(skip: number, limit: number): Observable<ServerResponse<any>> {
    const url = `users/invite/list-page?skip=${skip}&limit=${limit}`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUserLocationByIp(): Observable<any> {
    const url = `get-user-location`;
    return this._apiService.get(url, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public acceptToJoinEvent(body): Observable<any> {
    const url = `users/event/join`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public declineToJoinEvent(body): Observable<any> {
    const url = `users/event/unjoin`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public acceptToJoinGroupInvite(body): Observable<any> {
    const url = `users/invite/accept-group`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public acceptToJoinGroupAsAdmin(body): Observable<any> {
    const url = `users/accept-group`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public declineToJoinGroupInvite(body: any): Observable<any> {
    const url = `users/invite/decline-group?group_id=${body.group_id}`;
    return this._apiService.delete(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public declineToJoinGroupInviteAsAdmin(body: any): Observable<any> {
    const url = `users/invite/decline-user-group?group_id=${body.group_id}&user_id=${body.user_id}`;
    return this._apiService.delete(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public declineToJoinPageInvite(pageId: string): Observable<any> {
    const url = `users/invite/decline-page?page_id=${pageId}`;
    return this._apiService.delete(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public acceptToJoinPageInvite(body): Observable<any> {
    const url = `users/invite/accept-page`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getNotifications(skip: number, limit: number): Observable<ServerResponse<any>> {
    const url = `users/get-user-notifications?skip=${skip}&limit=${limit}`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public deleteNotification(notifyId: string): Observable<ServerResponse<any>> {
    const url = `users/delete-user-notifications?id=${notifyId}`;
    return this._apiService.delete(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public changeUserPassword(body: PasswordModel | object): Observable<ServerResponse<UserModel>> {
    const url = `users/password`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

// /users/save-password
  public saveUserPassword(body: PasswordModel | object): Observable<ServerResponse<UserModel>> {
    const url = `users/save-new-password`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }


  public changeAppLang(body: { lang: string }): Observable<ServerResponse<UserModel>> {
    const url = `users/lang`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUserNotificationsSettings(): Observable<ServerResponse<UserModel>> {
    const url = `users/notification-settings`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateUserNotoficationsSettings(body: any): Observable<ServerResponse<any>> {
    const url = `users/notification-settings`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );

  }

  public updateOrganizationSocials(body: SocialLinksModel): Observable<ServerResponse<any>> {
    const url = `users/update-page-social-links`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public deleteUser(body: { text: string, password: string }): Observable<ServerResponse<any>> {
    const url = `users/delete-user`;
    return this._apiService.delete(url, true, true, true, null, null, null, body).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateProfUserInfo(body: any): Observable<ServerResponse<UserModel>> {
    let url = `users/`;
    let data = body;

    if (body.type && body.type === 'website') {
      url += 'update-page-website';
    } else if(body.type && body.type === 'update-page-times') {
      url += 'update-page-times';
    } else if('description'){
        url += 'update-page-description'
    } else{
      url += 'update-page';
    }
      return this._apiService.put(url, data, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateProfUserEmail(body: any): Observable<ServerResponse<UserModel>> {
    const url = `users/add-email`;

    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateBusinessData(body: any): Observable<ServerResponse<UserModel>> {
    const url = `users/update-page-info`;

    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateProfUserPhone(body: any): Observable<ServerResponse<UserModel>> {
    const url = `users/add-phone`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getCreatedEvents(limit: number, skip: number, id: string): Observable<ServerResponse<any>> {
    const url = `events/prof-ser-events?limit=${limit}&skip=${skip}&id=${id}`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  // update user interests
  public updateUserInterests(data): Observable<ServerResponse<Array<EventModel>>> {
    const url = `users/update-user-interested-categories-interested-page`;
    return this._apiService.put(`${url}`, {categories: data}, true, true, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

// get user interested events by categories
  public getUserInterestEvents(): Observable<ServerResponse<Array<EventModel>>> {
    const url = `users/get-user-interested-events`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public connectSocial(data, type: string) {
    const url = `users/${type}`;
    return this._apiService.put(url, data, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public disconnectSocial(data, type: string) {
    const url = `users/${type}`;
    return this._apiService.put(url, data, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public sendInvitation(body: any): Observable<ServerResponse<any>> {
    const url = `users/page/invite-users`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public sendInvitationByEmail(body: any): Observable<ServerResponse<any>> {
    const url = `users/page/invite-by-emails`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public updateEmail(body) {
    const url = `users/update-email`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getNotificationCount() {
    const url = `users/get-user-notifications-count`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getUserPageStatistics(pageId) {
    const url = `users/get-homepage-statistics?u_id=${pageId}`;
    return this._apiService.get(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public putFacebookAutoShare(body) {
    const url = `users/update-page`;
    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public connectTwitter(body): Observable<any> {
    const url = `users/twitter-connect`;

    return this._apiService.put(url, body, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public markAllAsRead(uId){
    const url = `users/mark-all-as-read?u_id=${uId}`;

    return this._apiService.get(url,  true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public markAsReadById(id, uId){
    const url =`users/mark-as-read/${id}?u_id=${uId}`;

    return this._apiService.get(url,  true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public getBlockedData(u_id:string, skip:number, limit:number, type:string): Observable<any> {
      let url = `/block-list?u_id=${u_id}&skip=${skip}&limit=${limit}`;
      switch (type){
          case 'users':
              url = 'users'+url;
              break;
          case 'events':
              url = 'events'+url;
              break;
          case 'groups':
              url = 'group'+url;
      }

      return this._apiService.get(url, true, true, true).pipe(
          catchError((err) => {
              /* transform error message by status code */
              const transformedError = this._transformErrorService.transformError(err);
              return throwError(transformedError);
          })
      );
  }

  public unblockData(u_id:string, type:string): Observable<any> {
      let url = `/unblock/${u_id}`;
      switch (type){
          case 'users':
              url = 'users'+url;
              break;
          case 'events':
              url = 'events'+url;
              break;
          case 'group':
              url = 'group'+url;
      }
      return this._apiService.get(url, true, true, true).pipe(
          catchError((err) => {
              /* transform error message by status code */
              const transformedError = this._transformErrorService.transformError(err);
              return throwError(transformedError);
          })
      );
  }
}
