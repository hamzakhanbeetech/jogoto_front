import {Injectable} from '@angular/core';
import {ApiService} from '../../../../services';
import {Observable} from 'rxjs';
import {ServerResponse} from '../../../../models/global.models';

@Injectable()
export class GroupsService {

  constructor(private _apiService: ApiService) {
  }

  public getUserGroups(id: string, type: string, skip = 0, limit: number, name): Observable<ServerResponse<any>> {
    return this._apiService.get(`group/user-groups/${id}?type=${type}&skip=${skip}&limit=${limit}&name=${name}`, true, true, true);
  }
}
