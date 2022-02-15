import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { ServerResponse } from "../models";
import { catchError } from "rxjs/operators";
import { ApiService } from "./api.service";
import { TransformErrorService } from "./transform-error.service";

@Injectable({ providedIn: "root" })
export class UploadService {
  constructor(
    private _apiService: ApiService,
    private _transformErrorService: TransformErrorService
  ) {}

  public uploadImage(body): Observable<ServerResponse<any>> {
    return this._apiService
      .post(`events/save-image`, body, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError =
            this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }

  public uploadVideo(video): Observable<ServerResponse<any>> {
    return this._apiService
      .post(`events/save-video`, { file: video }, true, false, true)
      .pipe(
        catchError((err) => {
          /* transform error message by status code */
          const transformedError =
            this._transformErrorService.transformError(err);
          return throwError(transformedError);
        })
      );
  }
}
