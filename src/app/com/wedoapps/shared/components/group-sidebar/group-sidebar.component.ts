import {Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {ImportFileComponent} from '../modal/import-file/import-file.component';
import {Router, RoutesRecognized} from '@angular/router';
import {GroupModel, ServerResponse} from '../../../models/global.models';
import {InitialService} from '../../../views/main/initial/initial.service';
import {CurrentUser} from '../../../views/main/group/group.models';
import {GroupService} from '../../../views/main/group/group.service';
import {CookieService} from 'ngx-cookie';
import {InviteByEmailComponent} from '../modal/invite-by-email/invite-by-email.component';
import {IviteModalComponent} from '../modal/ivite-modal/ivite-modal.component';
import {SubjectsInteractionsService, UtilitesService} from '../../../services';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-group-sidebar',
  templateUrl: './group-sidebar.component.html',
  styleUrls: ['./group-sidebar.component.scss']
})
export class GroupSidebarComponent implements OnInit, OnDestroy {
  public previewPage: boolean;
  public groupData: GroupModel;
  @Input('moderatorsAdminsArray') public moderatorsAdminsArray: Array<any>;
  @Input('checkGroupState') public checkGroupState: boolean;
  @Input('usersArray') public usersArray: Array<any>;
  @Output('selectUserTab') selectUserTab: EventEmitter<number> = new EventEmitter<number>();
  @Output('isJoined') joined: EventEmitter<GroupModel> = new EventEmitter<GroupModel>();
  @Input('isMembersTab') public isMembersTab: boolean = false;
  @Input('isAuthorized') public isAuthorized: boolean;
  public suggestedGroups = [];
  public membersCount: number;
  public _user_id = this._cookieService.get('user_id');
  public loading: boolean = false;
  private unsubscribe$: Subject<void> = new Subject<void>();

  @Input('groupData')
  public set getGroupData(data: GroupModel) {
    this.groupData = data;
    this.loading = false;
  }

  constructor(private _dialog: MatDialog,
              private _router: Router,
              private _initialService: InitialService,
              private _groupService: GroupService,
              private _cookieService: CookieService,
              private _subjectService: SubjectsInteractionsService,
              private utilitesService: UtilitesService
              ) {
  }

  ngOnInit() {
    if (this._router.url.match('/preview')) {
      this.previewPage = true;
    } else {
      this.previewPage = false;

    }
    this.membersCount = this.groupData.standart_users_count;
    this._router.events
      .subscribe(async (event) => {
        if (event instanceof RoutesRecognized) {
          if (event.url.match('/preview')) {
            this.previewPage = true;
          } else {
            this.previewPage = false;
          }
        }
      });
    this._subjectService.joinGroup
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.usersArray = data.members;
        this.membersCount = data.members_count;
      });
    this._subjectService.adminMemberGroup
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.moderatorsAdminsArray = data.moderatorsAdminsArray;
        this.usersArray = data.otherMembers;
        this.membersCount = this.usersArray.length;
      });
  }

  public openDialogFileUpload(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {};
    dialogConfig.data.type = 'group';
    dialogConfig.data.id = this.groupData._id;
    const dialogRef = this._dialog.open(ImportFileComponent, dialogConfig);
  }

  public openInviteMembersByEmailModal() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {};
    dialogConfig.data.id = this.groupData._id;
    dialogConfig.data.type = 'group';
    const dialogRef = this._dialog.open(InviteByEmailComponent, dialogConfig);
  }

  public openInviteMembersModal(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {};
    dialogConfig.data.id = this.groupData._id;
    dialogConfig.data.type = 'group';
    let dialogRef = this._dialog.open(IviteModalComponent, dialogConfig);
  }


  public selectUserTabPanel(): void {
    this.selectUserTab.emit(2);
  }

  public redirectToSearch(): void {
    const localisedUrl = this.utilitesService.localizeRouter('/search');
    this._router.navigate([localisedUrl], {queryParams: {type: 'group'}});
  }

  public followGroup(groupId: string, isSuggested: boolean = false): void {
    if (this.isAuthorized) {
      this.loading = true;
      if (!this.groupData.imJoined) {
        this._groupService.followOrJoinGroup(groupId, this._user_id)
          .subscribe((value: ServerResponse<GroupModel>) => {
            this.groupData.imJoined = true;
            this.loading = false;
            this.joined.emit(value.data);
          });
      } else {
        this.deleteUserFromGroup(groupId);
      }
    } else {
      this.navigate(groupId);
    }
  }

  public joinGroup(groupId: string) {
    if (this.isAuthorized) {
      this.loading = true;
      if (this.groupData.state) {
        this.deleteUserFromGroup(groupId);
      } else {
        this._groupService.followOrJoinGroup(groupId, this._user_id)
          .subscribe((value) => {
            this.groupData = value.data;
            this.joined.emit(this.groupData);
          });
      }
    } else {
      this.navigate(groupId);
    }
  }

  public joinFollowSuggestedGroup(groupId: string, index: number) {
    this._groupService.followOrJoinGroup(groupId, this._user_id)
      .subscribe((value) => {
        this.suggestedGroups[index].imJoined = true;
      });
  }

  private deleteUserFromGroup(groupId: string) {
    this._groupService.deleteUserFromGroup(this._user_id, this._user_id, groupId)
      .subscribe(value => {
        this.groupData.imJoined = false;
        this.groupData.state = false;
        this.joined.emit(this.groupData);
        this.loading = false;
      }, err => {

      });
  }

  private navigate(groupId: string) {
    const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
    this._router.navigate([localisedUrl],
      {queryParams: {group: groupId}});
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
