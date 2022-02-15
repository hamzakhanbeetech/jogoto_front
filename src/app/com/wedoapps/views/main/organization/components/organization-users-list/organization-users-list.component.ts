import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {UserModel} from '../../../../../models';
import {SubjectsInteractionsService, UserService, UtilitesService} from '../../../../../services';
import {Router} from '@angular/router';

@Component({
  selector: 'app-organization-users-list',
  templateUrl: './organization-users-list.component.html',
  styleUrls: ['./organization-users-list.component.scss']
})
export class OrganizationUsersListComponent implements OnInit {
  @Input()
  public user: UserModel;
  @Input()
  public isModerator: boolean;
  @Input()
  public isCurrentUserPageOwner: boolean;
  @Input()
  public isCurrentUser:boolean;

  @Output()
  public removeModerator: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  public addModerator: EventEmitter<{ moderators: string[] }> = new EventEmitter<{ moderators: string[] }>();

  public isFollowLoading: boolean = false;
  public isAuthorized: boolean = this._subjectService.checkUserState();

  constructor(private _userService: UserService,
              private _router: Router,
              private _subjectService: SubjectsInteractionsService,
              private _utilitesServiec: UtilitesService
  ) {
  }

  ngOnInit() {
  }

  public toggleFollow(id: string): void {
    if (this.isAuthorized) {
      this.isFollowLoading = !this.isFollowLoading;
      this._userService.followToUser(id)
        .subscribe(res => {
          this.user.im_follow = !this.user.im_follow;
          this.isFollowLoading = !this.isFollowLoading;
        });
    } else {
      const localisedUrl = this._utilitesServiec.localizeRouter('/auth/login');
      this._router.navigate([localisedUrl]);
    }
  }

  public addNewModerator(moderatorId: string): void {
    const body = {
      moderators: [
        moderatorId
      ]
    };

    this.addModerator.emit(body);

  }

  public removeModeratorFromList(moderatorId: string): void {

    this.removeModerator.emit(moderatorId);
  }
}
