import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GroupsService} from './groups.service';
import {ActivatedRoute, Router} from '@angular/router';
import {EventModel, GroupModel, InfoModel, NoResultModel, UserInfoModel} from '../../../../models/global.models';
import {Subject, Subscription} from 'rxjs';
import {TabsetComponent} from 'ngx-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {CookieService} from 'ngx-cookie';
import {SubjectsInteractionsService} from '../../../../services';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {DeleteComponent} from '../../../../shared/components/modal/delete/delete.component';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.view.html',
  styleUrls: ['./groups.view.scss']
})
export class GroupsView implements OnInit, OnDestroy {
  public groupsIn: Array<GroupModel>;
  public groupsManage: Array<GroupModel>;
  public groupsArchive: Array<GroupModel>;
  public inputValue: string = '';
  public isLoadingManage: boolean = true;
  public isLoadingArchive: boolean = true;
  public isLoadingIn: boolean = true;
  public resetBtn: boolean = false;
  public manageCount: number = 0;
  public inCount: number = 0;
  public archiveCount: number = 0;
  public noResult: NoResultModel;
  public noResultBlock: boolean = false;
  public userInfo: UserInfoModel;
  private manageLimit: number = 8;
  private inLimit: number = 8;
  private archiveLimit: number = 8;
  private userId = this._activatedRoute.snapshot.paramMap.get('id');
  private subscription: Subscription;
  private groupType: string = 'manage';
  public autorizatedUser: boolean = false;
  public deleteGroupTexts: any;
  private _subscription: Subscription;
  @ViewChild('searchText', { static: true }) searchText: ElementRef;
  @ViewChild('groupsTabs', { static: true }) private groupsTabs: TabsetComponent;
  private unsubscribe$: Subject<void> = new Subject<void>();


    constructor(private _groupsService: GroupsService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private translate: TranslateService,
              private _cookieService: CookieService,
              private _subjectsInteractionsService: SubjectsInteractionsService,
              private _dialog: MatDialog) {
  }

  ngOnInit() {
    this.translate.get(['delete_group', 'delete_group_title', 'delete_group_description', 'delete'])
      .subscribe((translated: any) => {
        this.deleteGroupTexts = {
          header: translated.delete_group,
          title: translated.delete_group_title,
          description: translated.delete_group_description,
          button: translated.delete
        };
      });
    this._subscription = this._subjectsInteractionsService.followUnfollowGroup.subscribe(data => {
      if (data === true) {
        this.getUserGroups(this.inLimit);
      } else {
        this.getUserGroups(this.inLimit);
        this.getUserGroups(this.manageLimit);
      }

    });
    if (this._cookieService.get('user_id') === this.userId) {
      this.autorizatedUser = true;
    }
    if (!this.searchText.nativeElement.value && !this.noResultBlock) {
      this.translate.get('no-result.no_groups_show').subscribe((translated: string) => {
        this.noResult = {
          'icon': 'icon-group',
          'text': translated
        };
      });
    }
    if (this.groupsTabs.tabs[0].active && !this._activatedRoute.snapshot.queryParams.type) {
      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: {
          type: 'manage'
        },
        queryParamsHandling: 'merge',
      });
    }

    this.subscription = this._activatedRoute.queryParams.subscribe(param => {
      switch (param.type) {
        case 'manage':
          this.groupType = param.type;
          this.groupsTabs.tabs[0].active = true;
          this.getUserGroups(this.manageLimit);
          break;
        case 'in':
          this.groupType = param.type;
          this.groupsTabs.tabs[1].active = true;
          this.getUserGroups(this.inLimit);
          break;
        case 'archive':
          if (this.autorizatedUser) {
            this.groupType = param.type;
            setTimeout(() => {
              this.groupsTabs.tabs[2].active = true;
            }, 0);
            this.getUserGroups(this.archiveLimit);
          } else {
            this.groupType = param.type;
            this.groupsTabs.tabs[0].active = true;
            this.getUserGroups(this.manageLimit);
          }
          break;
        default  :
          this.groupsTabs.tabs[0].active = true;
          this.getUserGroups(this.manageLimit);
      }
    });
    this._subjectsInteractionsService.pageTags.next({title:`tags.groups_title`, desc:`tags.groups_desc`});
      this._activatedRoute.paramMap
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((param:any) => {
              if(this.userId != param.params.id){
                  this.userId = param.params.id;
                  this.autorizatedUser = this._cookieService.get('user_id') === this.userId
                  this.reset();
              }
          });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
  }

  public tabEventsFromClick(e) {
    this.noResultBlock = false;
    switch (e.elementRef.nativeElement.id) {
      case 'manage':
        this._router.navigate([], {
          relativeTo: this._activatedRoute,
          queryParams: {
            type: 'manage'
          },
          queryParamsHandling: 'merge',
        });
        break;
      case 'in':
        this._router.navigate([], {
          relativeTo: this._activatedRoute,
          queryParams: {
            type: 'in'
          },
          queryParamsHandling: 'merge',
        });
        break;
      case 'archive':
        this._router.navigate([], {
          relativeTo: this._activatedRoute,
          queryParams: {
            type: 'archive'
          },
          queryParamsHandling: 'merge',
        });
        break;
    }
    this.searchText.nativeElement.value = null;
    this.resetBtn = false;
  }

  public reset() {
    this.searchText.nativeElement.value = null;
    this.resetBtn = false;
    this.manageLimit = 8;
    this.inLimit = 8;
    this.archiveLimit = 8;
    this.subscription = this._activatedRoute.queryParams.subscribe(param => {
      switch (param.type) {
        case 'manage':
          this.getUserGroups(this.manageLimit);
          break;
        case 'in':
          this.getUserGroups(this.inLimit);
          break;
        case 'archive':
          this.getUserGroups(this.archiveLimit);
          break;
        default  :
          this.getUserGroups(this.manageLimit);
      }
    });
    this.noResultBlock = false;
  }

  public async search() {
    this.inputValue = await this.searchText.nativeElement.value;
    this.manageLimit = 8;
    this.inLimit = 8;
    this.archiveLimit = 8;
    if (this.inputValue.length > 0) {
      this.resetBtn = true;
      this.translate.get('no-result.no_results_for').subscribe((translated: string) => {
        this.noResult = {
          'icon': 'icon-calendar',
          'text': `${translated}`
        };
      });
      this.subscription = this._activatedRoute.queryParams.subscribe(param => {
        switch (param.type) {
          case 'manage':
            this.getUserGroups(this.manageLimit, this.inputValue);
            break;
          case 'in':
            this.getUserGroups(this.inLimit, this.inputValue);
            break;
          case 'archive':
            this.getUserGroups(this.archiveLimit, this.inputValue);
            break;
          default  :
            this.getUserGroups(this.manageLimit, this.inputValue);
        }
      });
    } else {
      this.resetBtn = false;
      this.noResultBlock = false;
      this.subscription = this._activatedRoute.queryParams.subscribe(param => {
        switch (param.type) {
          case 'manage':
            this.getUserGroups(this.manageLimit);
            break;
          case 'in':
            this.getUserGroups(this.inLimit);
            break;
          case 'archive':
            this.getUserGroups(this.archiveLimit);
            break;
          default  :
            this.getUserGroups(this.manageLimit);
        }
      });
      this.translate.get('no-result.no_groups_show').subscribe((translated: string) => {
        this.noResult = {
          'icon': 'icon-group',
          'text': translated
        };
      });
    }
  }

  public onScroll() {
    switch (this.groupType) {
      case 'manage':
        if (this.groupsManage && this.groupsManage.length < this.manageCount) {
          this.manageLimit += this.manageLimit;
          this.getUserGroups(this.manageLimit);
        } else {
          this.isLoadingManage = false;
        }
        break;
      case 'in':
        if (this.groupsIn.length < this.inCount) {
          this.inLimit += this.inLimit;
          this.getUserGroups(this.inLimit);
        } else {
          this.isLoadingIn = false;
        }
        break;
      case 'archive':
        if (this.groupsArchive.length < this.archiveCount) {
          this.archiveLimit += this.archiveLimit;
          this.getUserGroups(this.archiveLimit);
        } else {
          this.isLoadingArchive = false;
        }
        break;
    }
  }

  public getUserGroups(limit, name: string = ''): void {
    this._groupsService.getUserGroups(this.userId, this.groupType, 0, limit, name)
      .pipe(
        debounceTime(200)
      ).subscribe(data => {
      this.manageCount = data.info.manageCount;
      this.inCount = data.info.inCount;
      this.archiveCount = data.info.archiveCount;
      this.userInfo = data.info.user_data;
      if (!data.data.length && name.length) {
        this.noResultBlock = true;
      } else {
        this.noResultBlock = false;
        this.translate.get('no-result.no_groups_show').subscribe((translated: string) => {
          this.noResult = {
            'icon': 'icon-group',
            'text': translated
          };
        });
      }
      switch (this.groupType) {
        case 'manage':
          this.groupsManage = data.data;
          if (this.manageCount > this.manageLimit) {
            this.isLoadingManage = true;
          } else {
            this.isLoadingManage = false;
          }
          break;
        case 'in':
          this.groupsIn = data.data;
          if (this.inCount > this.inLimit) {
            this.isLoadingIn = true;
          } else {
            this.isLoadingIn = false;
          }
          break;
        case 'archive':
          this.groupsArchive = data.data;
          if (this.archiveCount > this.archiveLimit) {
            this.isLoadingArchive = true;
          } else {
            this.isLoadingArchive = false;
          }
          break;
      }
    });
  }

  public removeGroup(e) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      deleteTexts: this.deleteGroupTexts,
      id: e._id,
      type: 'group/remove',
      eventId: e._id,
      u_id: this.userId
    };
    const dialogRef = this._dialog.open(DeleteComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((id) => {
      this.groupsArchive = this.groupsArchive.filter((event) => {
        return event._id !== id;
      });
    });
  }
}
