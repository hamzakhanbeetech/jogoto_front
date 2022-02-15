import {Component, HostListener, OnInit} from '@angular/core';

import {MyInvitationsModels} from './my-invitations.models';
import {EventModel, NoResultModel} from '../../../../models/global.models';
import {SubjectsInteractionsService, UserService, UtilitesService} from '../../../../services';
import * as moment from 'moment';
import {TranslateService} from '@ngx-translate/core';
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'my-invitations-view',
  templateUrl: 'my-invitations.view.html',
  styleUrls: ['my-invitations.view.scss']
})
export class MyInvitationsView implements OnInit {
  public inviteEvents: MyInvitationsModels[] = [];
  public inviteGroups: MyInvitationsModels[] = [];
  public invitePages: MyInvitationsModels[] = [];
  public loaders: boolean[] = [];
  public inviteGroupsCount: number = 0;
  public inviteEventsCount: number = 0;
  public invitePageCount: number = 0;
  public isLoading: boolean = true;
  public isPending: boolean = false;
  public noResult: Array<NoResultModel>;

  private skip: number = 0;
  private limit: number = 6;
  private activeTab: string = 'eventInvitations';
  private scroll: () => void = this.onScroll;
  private hasMore: boolean = true;
  public locale: string;
  calls = new Subject();

  @HostListener('window:scroll', ['$event'])
  public onWindowScroll() {
    const onBottom: boolean = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
    if (onBottom && !this.isLoading && this.scroll && this.hasMore) {
      if (this.activeTab === 'eventInvitations' && this.inviteEventsCount > this.skip) {
        this.skip += 6;

        this.scroll();
      } else if (this.activeTab === 'groupInvitations' && this.inviteGroupsCount > this.skip) {
        this.skip += 6;

        this.scroll();
      } else if (this.activeTab === 'pageInvitations' && this.invitePageCount > this.skip) {
        this.skip += 6;

        this.scroll();
      }
    }
  }

  constructor(private _userService: UserService,
              private _subjectInteractions: SubjectsInteractionsService,
              private _utilities: UtilitesService,
              private _translate: TranslateService) {
  }

  ngOnInit() {
    this.getUserEventsInvitationsList(this.skip, this.limit);
    this._translate.get(['invitations.no_event', 'invitations.no_group', 'invitations.no_page']).subscribe((translated: string) => {
      this.noResult = [{
        'icon': 'icon-calendar',
        'text': this._translate.instant('invitations.no_event')
      },
        {
          'icon': 'icon-group',
          'text': this._translate.instant('invitations.no_group')
        },
        {
          'icon': '',
          'text': this._translate.instant('invitations.no_page')
        }];
    });
     this._subjectInteractions.getCurrentLang()
      .subscribe(lang => {
        this.locale = lang;
      });
    this._subjectInteractions.pageTags.next({title:`tags.invitations_title`, desc:`tags.invitations_desc`});
  }

  public getUserEventsInvitationsList(skip, limit) {
    this.isLoading = true;

    this._userService.getUserInvitationsList(skip, limit)
      .subscribe(res => {
        const inviteEvents = res.data;
        this.inviteEvents = inviteEvents;
        this.loaders.length = inviteEvents.length;
        Array.prototype.fill.apply(this.loaders, [false, 0, inviteEvents.length]);

        if (inviteEvents.length > 0) {
          this.inviteEventsCount = res.info.userInvitationCount;
          this.sortDate();
        }

        this.inviteGroupsCount = res.info.groupInvitationCount;
        this.invitePageCount = res.info.pageInvitationCount;
        this.isLoading = false;
      }, error => {
        console.log(error);
      });
  }

  public getUserGroupsInvitationsList(skip, limit) {
    this.isLoading = true;

    this._userService.getUserGroupInvitationsList(skip, limit)
      .subscribe(res => {
        const inviteGroups = res.data;
        this.inviteGroups = inviteGroups;
        this.loaders.length = inviteGroups.length;

        Array.prototype.fill.apply(this.loaders, [false, 0, inviteGroups.length]);

        if (inviteGroups.length > 0) {
          this.inviteGroups = inviteGroups;
          this.inviteGroupsCount = res.info.groupInvitationCount;
        }

        this.inviteEventsCount = res.info.userInvitationCount;
        this.isLoading = false;

      }, error => {
        console.log(error);
      });
  }

  public getUserPageInvitationsList(skip, limit) {
    this.isLoading = true;

    this._userService.getUserPageInvitationsList(skip, limit)
      .subscribe(res => {
        const invitePages = res.data;
        this.invitePages = invitePages;
        this.loaders.length = invitePages.length;

        Array.prototype.fill.apply(this.loaders, [false, 0, invitePages.length]);

        if (invitePages.length > 0) {
          this.inviteEventsCount = res.info.userInvitationCount;
          this.sortDate();
        }

        this.inviteGroupsCount = res.info.groupInvitationCount;
        this.invitePageCount = res.info.pageInvitationCount;
        this.isLoading = false;
      }, error => {
        console.log(error);
      });
  }

  public trackByFn(index, item) {
    return item._id;
  }

  public sortDate(): void {
    if (this.inviteEvents.length > 0) {
      this.inviteEvents.forEach(event => {
        event.event.dates = this._utilities.checkDateTimeZone(event.event.dates);
        event.event.dates.sort((val1, val2) => {
          return moment.utc(val1.start).diff(moment.utc(val2.start));
        });
        const pastDate = event.event.dates[0];
        event.event.dates = event.event.dates.filter(
          date => {
            let dateA = moment(date.start).format('MM-DD-YYYY HH:mm:ss a');
            date.isSameDay = moment(date.start).isSame(moment(), "day") && moment(date.end).isSame(moment(), "day");
            return moment(dateA, 'MM-DD-YYYY HH:mm:ss').isSameOrAfter(moment())
          });
        if(!event.event.dates.length){
          event.event.dates.push(pastDate)
        }
      });
    }
  }

  public acceptToJoinEvent(event: EventModel, index: number) {
    this.calls.next(true);
    this.loaders[index] = true;
    const body = {
      event_id: event._id,
    };

    this._userService.acceptToJoinEvent(body)
      .subscribe(res => {
        this.loaders.splice(index, 1);
        this.inviteEvents = this.inviteEvents.filter(invite => {
          return invite.event._id !== event._id;
        });
        this.inviteEventsCount -= 1;
      }, error => {
        console.log(error);
      });
  }

  public declineToJoinEvent(event: EventModel, index: number): void {
    this.calls.next(true);
    this.loaders[index] = true;
    const body = {
      event_id: event._id,
    };

    this._userService.declineToJoinEvent(body)
      .pipe(takeUntil(this.calls))
      .subscribe(res => {
        this.loaders.splice(index, 1);
        this.inviteEvents = this.inviteEvents.filter(invite => {
          return invite.event._id !== event._id;
        });
        this.inviteEventsCount -= 1;
      }, error => {
        console.log(error);
      });
  }


  public acceptToJoinGroupEvent(group: EventModel, index: number, user_id: string): void {
    this.calls.next(true);
    this.loaders[index] = true;
    const body = {
      group_id: group._id,
      user_id
    };

    this._userService.acceptToJoinGroupInvite(body)
      .pipe(takeUntil(this.calls))
      .subscribe(res => {
        this.loaders.splice(index, 1);

        this.inviteGroups = this.inviteGroups.filter(invite => {
          return invite.group._id !== group._id;
        });
        this.inviteGroupsCount -= 1;
      }, err => {
        console.log(err);
      });
  }

  public acceptToJoinPageInvite(pageId: EventModel, index: number): void {
    this.calls.next(true);
    this.loaders[index] = true;
    const body = {
      page_id: pageId._id,
    };

    this._userService.acceptToJoinPageInvite(body)
      .pipe(takeUntil(this.calls))
      .subscribe(res => {
        this.loaders.splice(index, 1);

        this.invitePages = this.invitePages.filter(invite => {
          return invite.page._id !== pageId._id;
        });
        this.invitePageCount -= 1;
      }, err => {
        console.log(err);
      },);
  }

  public declineToJoinGroupEvent(groupId: string, index: number): void {
    this.calls.next(true);
    this.loaders[index] = true;

    this._userService.declineToJoinGroupInvite(groupId)
      .pipe(takeUntil(this.calls))
      .subscribe(res => {
        this.loaders.splice(index, 1);
        this.inviteGroups = this.inviteGroups.filter(invite => {
          return invite.group._id !== groupId;
        });
        this.inviteGroupsCount -= 1;
      });

  }

  public declineToJoinPageInvite(pageId: string, index: number): void {
    this.calls.next(true);
    this.loaders[index] = true;
    this._userService.declineToJoinPageInvite(pageId)
      .pipe(takeUntil(this.calls))
      .subscribe(res => {
      this.loaders.splice(index, 1);
      this.invitePages = this.invitePages.filter(invite => {
        return invite.page._id !== pageId;
      });
        this.invitePageCount -= 1;
    }, err => {
      console.log(err);
    });

  }

  public changeTab(e): void {
    this.skip = 0;
    this.activeTab = e.id;
    this.hasMore = true;

    if (this.activeTab === 'eventInvitations') {
      this.getUserEventsInvitationsList(this.skip, this.limit);
    } else if (this.activeTab === 'groupInvitations') {
      this.getUserGroupsInvitationsList(this.skip, this.limit);
    } else if (this.activeTab === 'pageInvitations') {
      this.getUserPageInvitationsList(this.skip, this.limit);
    }
  }

  private onScroll(): void {
    let methodName: string;
    this.skip += 6;
    this.isLoading = true;

    if (this.activeTab === 'eventInvitations') {
      methodName = 'getUserInvitationsList';
    } else {
      methodName = 'getUserGroupInvitationsList';
    }

    this._userService[methodName](this.skip, this.limit)
      .subscribe(res => {
        if (Object.keys(res.data).length > 0) {
          if (this.activeTab === 'eventInvitations') {
            if (res.data.inviteEvents.length > 0) {
              this.inviteEvents.push(...res.data.inviteEvents);
              this.loaders.length = this.inviteEvents.length;

              Array.prototype.fill.apply(this.loaders, [false, this.skip, this.inviteEvents.length]);

              this.sortDate();
            } else {
              this.hasMore = false;
            }
          } else {
            if (res.data.inviteGroups.length > 0) {
              this.inviteGroups.push(...res.data.inviteGroups);
              this.loaders.length = this.inviteGroups.length;

              Array.prototype.fill.apply(this.loaders, [false, this.skip, this.inviteGroups.length]);

            } else {
              this.hasMore = false;
            }
          }
        }
        this.isLoading = false;
      }, error => {
        console.log(error);
      });

  }
}
