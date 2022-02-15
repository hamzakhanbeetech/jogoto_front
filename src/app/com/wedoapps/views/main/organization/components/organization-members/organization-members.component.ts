import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {GroupModel, MemberModel, NoResultModel, ServerResponse, UserModel} from '../../../../../models/index';

import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {SubjectsInteractionsService, UserService} from '../../../../../services/index';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-organization-members',
  templateUrl: './organization-members.component.html',
  styleUrls: ['./organization-members.component.scss']
})
export class OrganizationMembersComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  public followers: UserModel[];
  @Input()
  public moderators: UserModel[];
  @Input()
  public searchResult: UserModel[];
  @Input()
  public id: string;

  @Output()
  public searchText: EventEmitter<string> = new EventEmitter<string>();

  public showLoading: boolean;
  public search: FormControl = new FormControl('');
  public noResult: NoResultModel;
  public noFollowers: NoResultModel;
  public isMore: boolean = false;
  public showItemsCount: number = 2;
  public isCurrentUserModerator: boolean;
  public userId: string;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private _dialog: MatDialog,
              private _userService: UserService,
              private _subjectService: SubjectsInteractionsService,
              private _translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.showLoading = false;

    if (changes['moderators'] && changes['moderators'].currentValue) {
      const currentUser: UserModel = JSON.parse(localStorage.getItem('user_data'));
      this.userId = currentUser._id;
      if (currentUser) {
        this.moderators.forEach(moderator => {
          if (moderator._id === currentUser._id) {
            this.isCurrentUserModerator = true;
          }
        });
      }
    }

  }

  ngOnInit() {
    this._translate.get(['no-result.no_results_for', 'organizer-page.no_members'], [1, 2])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((translated: string) => {
        this.noResult = {
          'icon': 'icon-search-user',
          'text': this._translate.instant('no-result.no_results_for')
        };
        this.noFollowers = {
          'icon': 'icon-user-follower',
          'text': this._translate.instant('organizer-page.no_members')
        };
      });
  }


  public searchModerators(e: string): void {
    this.showLoading = !this.showLoading;

    if (this.search.value.length) {
      this.searchText.emit(e);
    } else {
      this.searchResult = [];
    }
  }

  public addModerator(data: any, index: number): void {
    this._userService.addNewModerator(data)
      .subscribe(res => {
        this.moderators = res.data.moderators;
        this.followers.splice(index, 1);
      });
  }

  public removeModerator(moderatorId: string): void {
    this._userService.deleteModerator(moderatorId)
      .subscribe(res => {
          this.followers = res.data.followUsers;
          this.moderators = res.data.moderators;
      });
  }

  public showMore(): void {
    this.isMore = !this.isMore;
    this.showItemsCount = this.isMore ? this.moderators.length : 2;
  }

  public resetSearch(): void {
    this.search.patchValue('');
    this.searchResult = [];
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
