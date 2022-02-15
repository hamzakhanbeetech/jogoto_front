import {Component, OnInit, Input, OnDestroy, EventEmitter, Output} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UserModel } from '../../../models/global.models';
import {UtilitesService} from "../../../services/index";

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.scss']
})
export class SearchUsersComponent implements OnInit, OnDestroy {
  public userType: string = '';
  private _searchingData:any = {};
  @Input('users') public users: UserModel[] = [];
  @Input('searchingData')
  set searchingData($event) {
    if ($event) {
      this.userType = $event.userType || 'all';
      this._searchingData = $event;
    }
  }
  @Input('isAuthorized') public isAuthorized: boolean;
  @Input('isSearchPage') public isSearchPage: boolean = true;
  @Output()
  public unblockUser: EventEmitter<any> = new EventEmitter<any>();

    constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _utilitesServiec: UtilitesService
  ) { }

  ngOnInit() {
  }

  public changeUserType(userType: string): void {
    const localisedUrl = this._utilitesServiec.localizeRouter(`/search`);
    this._router.navigate([localisedUrl], {
      relativeTo: this._activatedRoute, queryParams: {
        type: 'user',
        query: this._searchingData.query || '',
        userType: userType
      }
    })
  }

  ngOnDestroy() {
  }

}
