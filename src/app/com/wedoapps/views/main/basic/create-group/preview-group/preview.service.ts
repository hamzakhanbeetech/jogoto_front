import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {GroupModel, ServerResponse} from '../../../../../models/global.models';
import {ApiService} from '../../../../../services';

@Injectable()
export class PreviewService {

  constructor(private _apiService: ApiService) {
  }

  public getGroupPreview(id): Observable<ServerResponse<GroupModel>> {
    return this._apiService.get(`group/creator/${id}`, true, true, true);
  }
}
