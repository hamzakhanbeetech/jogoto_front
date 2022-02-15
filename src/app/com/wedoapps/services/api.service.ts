import {of, Observable} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {Injectable, Inject} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {SubjectsInteractionsService} from './subjects-interactions.service';
import {environment} from '../../../../environments/environment';
import {RequestParams} from '../models/global.models';
import {AppService} from './../../../app.service';
import {CookieService} from 'ngx-cookie';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class ApiService {
  private _baseUrl: string = environment.BASE_URL;

  constructor(
    private _httpClient: HttpClient,
    private _cookieService: CookieService,
    private _subjectInteractionsService: SubjectsInteractionsService,
    private _appService: AppService,
    private _langServe: TranslateService
  ) {
  }

  /**
   *
   * @param url
   * @param authorization
   * @param observe
   * @param responseType
   * @param user_id
   * @param user_token
   */
  public get(url: string, authorization?: boolean, user_id?: boolean, user_token?: boolean, observe?: string, responseType?: string, cache: boolean = true): Observable<Object | any> {
    let path = url;
    if (!url.includes('&lang=')) {
      if (url.includes('?')) {
        path += `&lang=${this._langServe.currentLang || 'en'}`;
      } else {
        path += `?lang=${this._langServe.currentLang || 'en'}`;
      }
    }
      return this._httpClient.get(this._baseUrl + path, this._setRequestParams(authorization, user_id, user_token, observe, responseType, cache));
  }


  /**
   *
   * @param url - request url,
   * @param body - sending object
   * @param observe - httpOption for get full response
   * @param responseType
   */
  public post(url: string, body: object, authorization?: boolean, user_id?: boolean, user_token?: boolean, observe?: string, responseType?: string, cache: boolean = true): Observable<Object | any> {
    return this._httpClient.post(this._baseUrl + url, body, this._setRequestParams(authorization, user_id, user_token, observe, responseType, cache));
  }

  public postFormData(url: string, formData: FormData, authorization?: boolean, user_id?: boolean, user_token?: boolean, observe?: string, responseType?: string, cache: boolean = true): Observable<Object | any> {
    return this._httpClient.post(this._baseUrl + url, formData, this._setRequestParams(authorization, user_id, user_token, observe, responseType, cache));
  }

  /**
   *
   * @param url
   * @param body
   * @param observe
   * @param responseType
   * @param authorization
   * @param user_id
   * @param user_token
   */
  public put(url: string, body: object, authorization?: boolean, user_id?: boolean, user_token?: boolean, observe?: string, responseType?: string, cache: boolean = true): Observable<Object | any> {
    return this._httpClient.put(this._baseUrl + url, body, this._setRequestParams(authorization, user_id, user_token, observe, responseType, cache));
  }

  /**
   *
   * @param url
   * @param observe
   * @param responseType
   * @param authorization
   * @param user_id
   * @param user_token
   */
  public delete(url: string, authorization?: boolean, user_id?: boolean, user_token?: boolean, observe?: string, responseType?: string, cache: boolean = true, body?): Observable<Object | any> {
    let options: any = this._setRequestParams(authorization, user_id, user_token, observe, responseType, cache);
    if (body) {
      options.body = body;
    }
    return this._httpClient.delete(this._baseUrl + url, options);
  }

  /**
   *
   */
  public checkToken(): Observable<boolean> {
    return this.get('users/check/token', true, true, true, 'response', 'text', false)
      .pipe(
        map(() => {
          this._appService.setIsAuthorized(true);
          this._subjectInteractionsService.changeUserState(true);
          return true;
        }),
        catchError((err, caught) => {
          if (err.status == 401 || err.status == 404) {
            this._cookieService.removeAll();
            this._appService.setIsAuthorized(false);
            const lang = localStorage.getItem('currentLanguage');
              localStorage.clear();
            if (lang) {
              localStorage.setItem('currentLanguage', lang);
            }
            this._subjectInteractionsService.authorization.next({
              isAuthorized: false
            });
            this._subjectInteractionsService.changeUserState(false);
          }
          return of(true);
        }));
  }

  private _setRequestParams(authorization?: boolean, user_id?: boolean, user_token?: boolean, observe?: string, responseType?: string, cache: boolean = true): RequestParams {
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
    });
    if (authorization) {
      let token: string = 'w_g#lo845TRw&%kjk98##6562Nmh#$uiPPUijiLp9865Cvao28y';
      headers = headers.append('authorization', token);
    }

    if (user_id) {
      const id: string = this._cookieService.get('user_id') || '';
      headers = headers.append('u_id', id);
    }

    if (user_token) {
      const userToken: string = this._cookieService.get('user_token') || '';
      headers = headers.append('user_token', userToken);
    }
    if (!cache) {
      headers = headers.append('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0');
      headers = headers.append('Pragma', 'no-cache');
      headers = headers.append('Expires', '0');
    }

    let params: RequestParams = {headers: headers};
    if (observe == 'response') {
      params.observe = 'response';
    }
    if (responseType == 'text') {
      params.responseType = 'text';
    }

    return params;

  }

  /**
   *
   * @param data
   */
  private _updateCookies(data): void {
    this._cookieService.put('user_token', data.token);
    this._cookieService.put('refreshToken', data.refreshToken);
  }
}
