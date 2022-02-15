import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {GroupModel, ServerResponse} from '../../../models/global.models';
import {InitialService} from '../../../views/main/initial/initial.service';
import {CookieService} from 'ngx-cookie';
import {GroupService} from '../../../views/main/group/group.service';
import {SubjectsInteractionsService, UtilitesService} from '../../../services';

@Component({
  selector: 'app-sidebar-suggested-groups',
  templateUrl: './sidebar-suggested-groups.component.html',
  styleUrls: ['./sidebar-suggested-groups.component.scss']
})
export class SidebarSuggestedGroupsComponent implements OnInit {
  public suggestedGroups: Array<GroupModel>;
  public loading: boolean = false;
  public _user_id = this._cookieService.get('user_id');
  @Input('isAuthorized') public isAuthorized: boolean;
  @Input('groupId') public groupId: string;

  constructor(private _router: Router,
              private _initialService: InitialService,
              private _cookieService: CookieService,
              private _groupService: GroupService,
              private _subjectsInteractionsService: SubjectsInteractionsService,
              private utilitesService: UtilitesService
              ) {
  }

  ngOnInit() {
    this._getSuggestedGroups();
    this._subjectsInteractionsService.followUnfollowGroup.subscribe(data => {
        this._getSuggestedGroups();
    });
  }

  private _getSuggestedGroups() {
    this._initialService.getSuggestedGroups(
      2,
      1,
      null,
      null,
      this.isAuthorized,
      this.groupId,
      this._user_id)
      .subscribe((groups: ServerResponse<any>) => {
        this.suggestedGroups = groups.data;
      });
  }

  public joinGroup(groupId: string, isSuggested: boolean = false, index: number = null) {
    if (this._user_id) {
      this.loading = true;
      this._groupService.followOrJoinGroup(groupId, this._user_id)
        .subscribe((value) => {
          if (isSuggested) {
            this.suggestedGroups[index].imJoined = true;
            this._subjectsInteractionsService.followUnfollowGroup.next(true);
          }
        });
    } else {
      const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
      this._router.navigate([localisedUrl], {queryParams: {group: groupId}});
    }
  }
}
