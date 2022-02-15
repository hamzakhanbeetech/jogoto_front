import {Injectable} from '@angular/core';
import {catchError} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {ApiService} from './api.service';
import {TransformErrorService} from './transform-error.service';
import {authConfig} from '../params/auth.config';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LinkedinService {

  constructor(private _apiService: ApiService,
              private _http:HttpClient,
              private _transformErrorService: TransformErrorService) {
  }

  public getLinkedinUserData(param: string) {
      const url = `users/linkedin-connect`;
    return this._apiService.put(url, {linkedinToken: param}, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

  public sendRequest(code, url):Observable<any>{
      return this._http.post(url,{})
  }
}
