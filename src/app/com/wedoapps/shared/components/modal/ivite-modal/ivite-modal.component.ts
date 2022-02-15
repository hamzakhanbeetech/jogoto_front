import {FormBuilder, FormGroup, FormArray, FormControl} from '@angular/forms';
import {Component, Inject, OnInit, ViewEncapsulation, OnDestroy} from '@angular/core';

import {EventService} from '../../../../views/main/event/event.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {UserService} from '../../../../services';
import {UserModel} from '../../../../models';
import {CookieService} from 'ngx-cookie';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {SearchService} from '../../../../views/main/search/search.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-ivite-modal',
  templateUrl: './ivite-modal.component.html',
  styleUrls: ['./ivite-modal.component.scss'],
})
export class IviteModalComponent implements OnInit, OnDestroy {
  public whenSelectedListShown: boolean = false;
  public activeSelectedTab: boolean = false;
  public querySkip: number = 0;
  public errorMessage: string = undefined;
  public queryLimit: number = 5;
  public loadMore: boolean = true;
  public requestLoading: boolean = false;
  public selectedUsersList: Array<any> = [];
  public thereIsOrNotResult: boolean = false;
  public loading: boolean = false;
  public followedUsersList: Array<any> = [];
  public isGroup: boolean;
  public resetButton: boolean = false;
  public notFollowers: boolean = false;
  public userId = this._cookieService.get('user_id');
  public pageId: string;

  public countSearch: number;
  public organization: UserModel;

  private _inviteUsersForm: FormGroup;
  private _usersForm: FormGroup;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<IviteModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private _userService: UserService,
              private _eventService: EventService,
              private _searchService: SearchService,
              private _cookieService: CookieService,
              private _fb: FormBuilder,
              private router: Router) {
  }

  ngOnInit() {
    this._formBuilder();
    this._checkInvitationType();
    let url = this.router.url.split('/');
    this.pageId = url[3];

    if (this.data.organization) {
      this.organization = this.data.organization;

      this.getOrganizationFollowedUsers(this.pageId, '', this.querySkip, this.queryLimit, false);
    } else {
      this.getFollowedUsers();
    }
  }

  private _checkInvitationType() {
    this.isGroup = this.data.type === 'group';
  }

  public resetSearchText(): void {
    this._inviteUsersForm.get('userName').patchValue('');
    this.resetButton = false;
  }

  public searchText(e) {
    this.resetButton = !!e.target.value;
    this.activeSelectedTab = false;
    this.countSearch = 0;

  }

  private _formBuilder(): void {
    this._inviteUsersForm = this._fb.group({
      userName: [''],
    });

    this._usersForm = this._fb.group({
      items: this._fb.array([]),
    });

    this._usersForm.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this._handleOnSearchEvent();
        if (this.selectedUsersList.length === 0 && this.whenSelectedListShown) {
          if (this._inviteUsersForm.get('userName').value) {
            this.querySkip = 0;

            if (this.organization) {
              this.onSearchUsersForOrgan(this._inviteUsersForm.get('userName').value);
            } else {
              this.onSearchUsers(this._inviteUsersForm.get('userName').value);
            }
          } else {
            this.querySkip = 0;
            if (this.data.organization) {
              this.getOrganizationFollowedUsers(this.pageId, '', this.querySkip, this.queryLimit, true);
            } else {
              this.getFollowedUsers(true);
            }
          }
        }

      });
    this._inviteUsersForm.get('userName').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        const value = data.trim();
        this.querySkip = 0;
        if (value && value.length !== 0) {
          if (this.organization) {
            this.onSearchUsersForOrgan(value);
          } else {
            this.onSearchUsers(value);
          }
        } else {
          this.thereIsOrNotResult = false;
          this.querySkip = 0;

          if (this.data.organization) {
            this.getOrganizationFollowedUsers(this.pageId, '', this.querySkip, this.queryLimit, true);
          } else {
            this.getFollowedUsers(true);
          }
        }
      });
  }

  public getFollowedUsers(searchEvent?: boolean): void {
    this.loading = true;
    this._eventService
      .getFollowersListOfUser(this.userId, this.data.id, this.queryLimit, this.querySkip, this.isGroup)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.followedUsersResponseHandler(data, searchEvent);
      }, err => {
        this.loading = false;
        this.errorMessage = err.error.message;
      });
  }

  public onSearchUsers(valueOfSearchInput: string, scrollEvent?: boolean): void {
    this.loading = true;
    this._eventService
      .searchUsersForInviting(this.userId, valueOfSearchInput, this.queryLimit, this.querySkip, this.data.id, this.isGroup)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.countSearch = data.info.count;

        this.searchResHandler(data, scrollEvent);
      }, error => {
        this.loading = false;
        this.errorMessage = error.error.message;
      });
  }

  public onSearchUsersForOrgan(valueOfSearchInput: string, scrollEvent?: boolean): void {
    this.loading = true;
    this._searchService.searchUsers(valueOfSearchInput, 'all', this.querySkip, this.queryLimit, true, this.organization._id)
      .subscribe((data) => {
        this.countSearch = data.info.count;
        this.searchResHandler(data, scrollEvent);
      }, error => {
        this.loading = false;
        this.errorMessage = error.error.message;
      });
  }

  public onDownScroll(): void {
    if (this._inviteUsersForm.get('userName').value || this.notFollowers) {
      this.followedUsersList.splice(5);
      this.loadMore = true;
      this.querySkip = 0;
    } else {
      if (this.loadMore) {
        this.followedUsersList.splice(5);
        this.loadMore = true;
        this.querySkip = 0;
      }
    }
  }

  public onScroll(): void {
    if (this._inviteUsersForm.get('userName').value || this.notFollowers) {
      if (this.countSearch > this.querySkip) {
        this.querySkip += 5;
      } else {
        this.loadMore = false;
      }

      if (this.organization) {
        this.onSearchUsersForOrgan(this._inviteUsersForm.get('userName').value, true);
      } else {
        this.onSearchUsers(this._inviteUsersForm.get('userName').value, true);
      }
      if (this.querySkip >= this.countSearch) {
        this.loadMore = false;
      }
    } else {
      if (this.loadMore) {
        this.querySkip += 5;
        if (this.data.organization) {
          this.getOrganizationFollowedUsers(this.pageId, '', this.querySkip, this.queryLimit, false);
        } else {
          this.getFollowedUsers();
        }
        if (this.querySkip >= this.countSearch) {
          this.loadMore = false;
        }
      }

    }
  }

  public onClickSendInvitation() {
    this.requestLoading = true;
    this._eventService
      .inviteUsers(this.userId, this.data, this.selectedUsersList.map(item => item._id))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.sendInvitationRespHandler();
      }, err => {
        this.requestLoading = false;
        this.errorMessage = err.error.message;

      });
  }

  public sendInvitationForOrgPage(): void {
    this.requestLoading = true;
    const body = {
      page_id: this.pageId,
      users: this.selectedUsersList.map(item => item._id)
    };

    this._userService.sendInvitation(body)
      .subscribe(() => {
        this.sendInvitationRespHandler();
      }, err => {
        this.requestLoading = false;
        this.errorMessage = err.error.message;
      });
  }

  public showSelecteds(): void {
    this.followedUsersList = [...this.selectedUsersList];
    this._updateFormArray(this.followedUsersList);
    this.loadMore = false;
    this.activeSelectedTab = true;
  }

  public selectedUsersOrNot(): string {
    if (this.selectedUsersList.length === 0) {
      this.whenSelectedListShown = false;
      return 'invite_users.no_selected';
    } else if (this.selectedUsersList.length > 0) {
      this.whenSelectedListShown = true;
      return 'invite_users.yes_selected';
    }
  }

  private _updateFormArray(usersList) {
    const formArray: FormArray = this._fb.array([]) as FormArray;
    for (let i = 0; i < usersList.length; i++) {
      formArray.push(new FormControl(this.selectedUsersList.map(item => item._id).indexOf(usersList[i]._id) > -1));
    }
    this._usersForm.setControl('items', formArray);
    return formArray;
  }

  private getOrganizationFollowedUsers(userId: string, query: string = '', skip: number, limit: number, searchEvent: boolean): void {
    this.loading = true;
    this._userService.getOrganizationFollowersList(userId, query, skip, limit)
      .subscribe(data => {
        this.followedUsersResponseHandler(data, searchEvent);
        }
      );
  }

  private _handleOnSearchEvent(): void {
    const itemsArray: FormArray = this._usersForm.get('items') as FormArray;
    for (let i = 0; i < this.followedUsersList.length; i++) {
      const id = this.followedUsersList[i]._id;
      const check = itemsArray.controls[i].value;
      const index = this.selectedUsersList.map(item => item._id).indexOf(id);
      if (check) {
        if (index === -1) {
          this.selectedUsersList.push({...this.followedUsersList[i]});
        }
      } else {
        if (index > -1) {
          this.selectedUsersList.splice(index, 1);
        }
      }
    }
  }

  private followedUsersResponseHandler(data: any, searchEvent: boolean) {
    this.countSearch = data.info.count;
    if (this.countSearch === 0) {
      if (this.organization) {
        this.onSearchUsersForOrgan('');
      } else {
        this.onSearchUsers('');
      }
      this.notFollowers = true;
    } else {
      if (this.countSearch > 5) {
        this.loadMore = true;
      } else {
        this.querySkip = 0;
        this.loadMore = false;
      }
      if (searchEvent) {
        this.followedUsersList = data.data;
      } else {
        this.followedUsersList.push(...data.data);
      }
      this._updateFormArray(this.followedUsersList);
      this.loading = false;
    }
  }

  private sendInvitationRespHandler(): void {
    this.requestLoading = false;
    this.dialogRef.close(true);
  }

  private searchResHandler(data: any, scrollEvent?: boolean): void {
    if (!this.countSearch) {
      this.thereIsOrNotResult = true;
    } else {
      this.thereIsOrNotResult = false;
      if (scrollEvent) {
        this.followedUsersList.push(...data.data);
      } else {
        this.followedUsersList = data.data;
      }
      if (this.countSearch > 5) {
        this.loadMore = true;
      } else {
        this.querySkip = 0;
        this.loadMore = false;
      }
      this._updateFormArray(this.followedUsersList);
    }
    this.loading = false;
  }

  get inviteUsersForm() {
    return this._inviteUsersForm;
  }

  get usersForm() {
    return this._usersForm;
  }

  get itemsControl(): FormArray {
    const controls = this._usersForm.get('items') as FormArray;
    return controls;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


}
