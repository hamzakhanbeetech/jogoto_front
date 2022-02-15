import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../../../../../environments/environment.prod';
import {catchError} from 'rxjs/operators';
import {ApiService, TransformErrorService} from '../../../services';
import {ServerResponse} from '../../../models/global.models';
import {CookieService} from 'ngx-cookie';


@Injectable()
export class ContactUsService {

  constructor(private _http: HttpClient,
              private _transformErrorService: TransformErrorService,
              private _apiService: ApiService) {
  }

  public sendContactMessages(data): Observable<ServerResponse<any>> {

    return this._apiService.post(`send-contact-email`, data, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError = this._transformErrorService.transformError(err);
          return throwError(transformedError);
        }));
  }

}
