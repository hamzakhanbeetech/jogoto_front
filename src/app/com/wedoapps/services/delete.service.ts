import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {ServerResponse} from '../models/global.models';
import {ApiService} from './api.service';
import {catchError} from 'rxjs/operators';
import {TransformErrorService} from './transform-error.service';

@Injectable()
export class DeleteService {

  constructor(private _apiService: ApiService,
              private _transformErrorService: TransformErrorService) {
  }

  public deleteAip(id: string, type: string, eventId: string, u_id: string): Observable<ServerResponse<any>> {
    let url = `${type}/${id}`;
    if (type === 'groupEvent') {
      url = `group/delete-group-event?event_id=${eventId}&group_id=${id}&u_id=${u_id}`;
    }
    return this._apiService.delete(url, true, true, true).pipe(
      catchError((err) => {
        /* transform error message by status code */
        const transformedError = this._transformErrorService.transformError(err);
        return throwError(transformedError);
      })
    );
  }

    public blockApi(id: string, type: string, eventId: string, u_id: string): Observable<ServerResponse<any>> {
        let url;
        if (type === 'block-events') {
            url = `events/block/${id}?u_id=${u_id}`;
        }else if(type === 'block-group'){
            url = `group/block/${id}?u_id=${u_id}`;
        }else if(type === 'block-users'){
            url = `users/block/${id}?u_id=${u_id}`;
        }

        return this._apiService.delete(url, true, true, true).pipe(
            catchError((err) => {
                /* transform error message by status code */
                const transformedError = this._transformErrorService.transformError(err);
                return throwError(transformedError);
            })
        );
    }
}
