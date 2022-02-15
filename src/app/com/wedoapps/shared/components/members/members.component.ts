import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  GroupModel,
  MemberModel,
  NoResultModel,
  ServerResponse,
  UserModel
} from '../../../models/global.models';
import {takeUntil} from 'rxjs/operators';
import {GroupService} from '../../../views/main/group/group.service';
import {Subject} from 'rxjs';
import {CurrentUser} from '../../../views/main/group/group.models';
import {FormControl} from '@angular/forms';
import {TabsetComponent} from 'ngx-bootstrap';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {SubjectsInteractionsService} from '../../../services';
import {CookieService} from 'ngx-cookie';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  @Input('members') public members: GroupModel;
  @Input('id') public id: string;
  public moderatorsAdminsArray: any[] = [];
  public autocompletResult: UserModel[] = [];
  public currentUser: CurrentUser = {} as CurrentUser;
  public otherMembers = [];
  public othersSkip: number = 6;
  public showLoading: boolean;
  public showLoadMore: boolean;
  public isAuthorized = this._subjectService.isAuthorizated.getValue();
  public moreMembers: boolean = true;
  public adminsToShow = [];
  public loading: boolean = false;
  public _user_id = this._cookieService.get('user_id');
  private arr: Array<any> = [];
  public moreSearch: boolean;
  public isSearch: boolean = false;
  private searchSkip: number = 0;
  private oldSkip: number;
  public searchValue: string;
  private requestTimer = null;
  public search: FormControl = new FormControl();
  public deleteTexts: any;
  public noResult: NoResultModel;
  public noSearchResult: boolean;
  private unsubscribe$: Subject<void> = new Subject<void>();
  @Output('moreMembers') private _value: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _dialog: MatDialog,
              private _activatedRoute: ActivatedRoute,
              private _groupService: GroupService,
              private _subjectService: SubjectsInteractionsService,
              private _router: Router,
              private _cookieService: CookieService,
              private _translate: TranslateService) {
  }

  ngOnInit() {
    this._translate.get('no-result.no_results_for').subscribe((translated: string) => {
      this.noResult = {
        'icon': 'icon-search-user',
        'text': translated
      };
    });
    this._subjectService.joinGroup
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this._sortUsers(data);
      });
    this._getMembersList(this.id);
  }

  private _getMembersList(id: string): void {
    this.autocompletResult = [];
    if (this.members) {
      this.search.reset();
    }
      this._sortUsers(this.members);
    this._PrepareCurrentUserInfo(this.members);
    this.showLoadMore = this.members.adminsAndModeratorsCount > 2;
    this.moreMembers = this.members.standart_users_count > 6;
  }

  private _sortUsers(data: GroupModel) {
    this.moderatorsAdminsArray = [];
    this.otherMembers = [];
    this.adminsToShow = [];
    this.arr = [];
    this.members = data;
    if( this.members.creator._id){
      this.moderatorsAdminsArray[0] = this.members.creator;
    }
    this.moderatorsAdminsArray.push(...this.members.moderators, ...this.members.admins);
    this.arr = [...this.arr, ...this.moderatorsAdminsArray];
    this.otherMembers = this.members.members;
    this.showMoreLessAdmins();
    this._subjectService.adminMemberGroup.next({moderatorsAdminsArray: this.moderatorsAdminsArray, otherMembers: this.otherMembers});
  }

  public showMoreLessAdmins(): void {
    let pushedList = [];
    if (this.arr.length > 0) {
      pushedList = this.arr.splice(0, 3);
      this.adminsToShow = [...this.adminsToShow, ...pushedList];
    } else {
      this.adminsToShow = [];
      this.arr = [...this.arr, ...this.moderatorsAdminsArray];
      pushedList = this.arr.splice(0, 3);
      this.adminsToShow = [...this.adminsToShow, ...pushedList];
    }
  }

  private _getGroupUsers(limit) {
    this.showLoading = true;
      this._groupService.getGroupUsers(this.othersSkip, limit, this.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value: ServerResponse<MemberModel[]>) => {
        value.data.map((member) => {
          this.otherMembers.push(member);
        });
        this.moreMembers = this.otherMembers.length <= this.othersSkip;
        this._value.emit({moreMembers:this.moreMembers, moreSearch:this.moreSearch})
        this.showLoading = false;
        this.othersSkip += 6;
      }, err => {
        console.log(err);
        this.showLoading = false;
      });
  }


  public onScroll() {
      if (this.isSearch && this.moreSearch) {
      this._membersSearch(this.searchValue, this.searchSkip, 5, true);
    } else if (!this.isSearch) {
      this._getGroupUsers(6);
    }
  }

  public resetSearch() {
    this.search.reset();
    this.searchValue = '';
    this.autocompletResult = [];
  }

  public autocomplet(value: string) {
    this.moreSearch = true;
    if (this.requestTimer !== null) {
      clearTimeout(this.requestTimer);
    }
    this.requestTimer = setTimeout(() => {
      this.searchValue = value;
      if (this.searchValue.trim().length >= 1) {
        this.isSearch = true;
        this.searchValue = value;
        this.searchSkip = 0;
        this._membersSearch(this.searchValue, this.searchSkip, 6);
      } else {
        this.isSearch = false;
        this.autocompletResult = [];
      }
    }, 500);
  }

  private _membersSearch(value: string, skip: number, limit: number, scroll: boolean = false) {
    this.showLoading = true;
    this._groupService.searchGroupUsers(value, this.id, skip, limit)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ServerResponse<UserModel[]>) => {
        if (data.data.length) {
          this.noSearchResult = false;
        }else {
          this.noSearchResult=true
        }
        if (scroll) {
          this.autocompletResult.push(...data.data);
        } else {
          this.autocompletResult = data.data;
        }
        this.showLoading = false;
        this.moreSearch = data.data.length > 5;
        this._value.emit({moreMembers:this.moreMembers, moreSearch:this.moreSearch})
        this.searchSkip += 6;
      });
  }


  private _PrepareCurrentUserInfo(members) {
    const arr = [...members.members, ...members.moderators, ...members.admins];
    if(members.creator._id){
      arr.push(members.creator)
    }
    for (const member of arr) {
      if (member._id === this._user_id) {
        this.currentUser = {
          creator: member.imCreator || false,
          moderator: member.moderator,
          admin: member.admin,
          joined: member.imJoined || member.im_follow
        };
      }
    }
  }

  public updatemembers(value: GroupModel): void {
    this._sortUsers(value);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
