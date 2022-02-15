import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router, RoutesRecognized} from '@angular/router';
import {GroupModel, MemberModel, ServerResponse, UserModel} from '../../../models/global.models';
import {CurrentUser} from '../../../views/main/group/group.models';
import {GroupService} from '../../../views/main/group/group.service';
import {CookieService} from 'ngx-cookie';
import {SubjectsInteractionsService, UtilitesService} from '../../../services';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  public page: boolean;
  @Input('user') public user: MemberModel;
  @Input('currentUser') public currentUser: CurrentUser;
  @Input('groupId') private _groupId: string;
  @Input('creatorId') private creatorId: string;
  @Output('updatedGroup') public _updatedGroup: EventEmitter<GroupModel> = new EventEmitter<GroupModel>();
  public _user_id = this._cookieService.get('user_id');
  private _user_token = this._cookieService.get('user_token');
  public permition: boolean = true;
  public permitionToMakeModerator: boolean;
  public permitionToMakeMember: boolean;
  public permitionToMakeAdmin: boolean;
  public permitionToRemoveMember: boolean;
  private isAuthorized = this._subjectService.isAuthorizated.getValue();
  public navRout: string = '';
  public isCreator: boolean;

  constructor(private _router: Router,
              private _groupService: GroupService,
              private _cookieService: CookieService,
              private _subjectService: SubjectsInteractionsService,
              private utilitesService: UtilitesService
  ) {
  }

  ngOnInit() {
    if (this._router.url.match('/preview')) {
      this.page = true;
    } else {
      this.page = false;
      this._checkUsers();
      this.navRout = this.user.register_type === 'individual' ? '/user/' : '/organization/';
      this.navRout += this.user._id;
    }
    this._router.events
      .subscribe(async (event) => {
        if (event instanceof RoutesRecognized) {
          if (event.url.match('/preview')) {
            this.page = true;
          } else {
            this.page = false;
          }
        }
      });
  }

  public makeModerator(id: string) {
    this._groupService.makeModerator(this._user_id, this._user_token, this._groupId, id)
      .subscribe((group: ServerResponse<GroupModel>) => {
        this._updatedGroup.emit(group.data);
      }, err => {
        console.log(err);
      });
  }

  public makeAdmin(id: string): void {
    this._groupService.makeAdmin(this._user_id, this._user_token, this._groupId, id)
      .subscribe((group: ServerResponse<GroupModel>) => {
        this._updatedGroup.emit(group.data);
      }, err => {
        console.log(err);
      });
  }

  public makeMember(id: string): void {
    this._groupService.makeMember(this._user_id, id, this._groupId)
      .subscribe((group: ServerResponse<GroupModel>) => {
        this._updatedGroup.emit(group.data);
      }, err => {
        console.log(err);
      });
  }

  public removeMember(id: string): void {
    this._groupService.removeMember(this._user_id, id, this._groupId)
      .subscribe((group: ServerResponse<GroupModel>) => {
        this._updatedGroup.emit(group.data);
      }, err => {
        console.log(err);
      });
  }

  private _checkUsers() {
    const isCreator = this.user._id === this.creatorId;
    this.isCreator = isCreator;
    if (this.currentUser.creator) {
      this.permitionToMakeModerator = !isCreator && !this.user.moderator;
      this.permitionToMakeAdmin = !isCreator && !this.user.admin;
      this.permitionToMakeMember = !isCreator && (this.user.admin || this.user.moderator);
      this.permitionToRemoveMember = !isCreator;
    } else if (this.currentUser.admin) {
      this.permitionToMakeAdmin = false;
      this.permitionToMakeModerator = !isCreator && !this.user.admin && !this.user.moderator;
      this.permitionToMakeMember = !isCreator && !this.user.admin;
      this.permitionToRemoveMember = !isCreator && !this.user.admin;
    } else if (this.currentUser.moderator) {
      this.permitionToMakeAdmin = false;
      this.permitionToMakeModerator = false;
      this.permitionToMakeMember = false;
      this.permitionToRemoveMember = !isCreator && !this.user.admin && !this.user.moderator;
    } else {
      this.permition = false;
    }

    this.permition = this.permitionToMakeAdmin ||
      this.permitionToMakeModerator ||
      this.permitionToMakeMember ||
      this.permitionToRemoveMember;
  }

  public followUser(id: string): void {
    if (this.isAuthorized) {
      this._groupService.followUser(this._user_id, this._user_token, id)
        .subscribe((value) => {
          this.user.im_follow = value.data.im_follow;
        });
    } else {
      const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
      this._router.navigate([localisedUrl],
        {queryParams: {group: this._groupId}});
    }
  }
}
