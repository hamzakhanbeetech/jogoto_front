import {Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewChecked} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {ImportFileComponent} from '../../../shared/components/modal/import-file/import-file.component';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupService} from './group.service';
import {
    CalendarEventModel, EventInCalendar,
    EventModel,
    GroupModel,
    MemberModel,
    NoResultModel, SendInfoToAlertMessage,
    ServerResponse,
    UserModel
} from '../../../models';
import {TabsetComponent} from 'ngx-bootstrap';
import {SubjectsInteractionsService, UtilitesService} from '../../../services';
import {UsersFileModel} from '../basic/create-group/create-group.models';
import {Subject, Subscription} from 'rxjs';
import {NotificationSettingsModalComponent} from '../../../shared/components/modal/notification-settings-modal/notification-settings-modal.component';
import {CookieService} from 'ngx-cookie';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {DeleteComponent} from '../../../shared/components/modal/delete/delete.component';
import {MetafrenzyService} from 'ngx-metafrenzy';
import {MembersComponent} from '../../../shared/components/members/members.component';
import {GroupSidebarComponent} from '../../../shared/components/group-sidebar/group-sidebar.component';
import * as moment from 'moment-timezone';


@Component({
    selector: 'groups-view',
    templateUrl: 'group.view.html',
    styleUrls: ['group.view.scss']
})
export class GroupView implements OnInit, OnDestroy, AfterViewChecked {
    public groupId: string;
    public groupData: GroupModel;
    public events: EventModel[] = [];
    public moderatorsAdminsArray: any[] = [];
    public calendarEvents: CalendarEventModel[];
    public autocompletResult: UserModel[] = [];
    public showEventClose: boolean;
    public otherMembers = [];
    public othersSkip: number = 6;
    public eventsSkip: number = 0;
    public eventsOldSkip: number;
    public eventsLimit: number = 1;
    public eventLoading: boolean;
    public showLoading: boolean;
    public isAuthorized = this._subjectService.isAuthorizated.getValue();
    public moreMembers: boolean = false; // fix when users list will be done by request
    public moreEvents: boolean = false;
    public adminsToShow = [];
    public checkGroupState: boolean;
    public loading: boolean = false;
    public _user_id = this._cookieService.get('user_id');
    private arr: Array<any> = [];
    public moreSearch: boolean;
    public search: FormControl = new FormControl();
    public deleteGroupTexts: any;
    public deleteEventTexts: any;
    public noResult: NoResultModel;
    public title: Array<object>;
    public lng: string;
    public showLoadMore: boolean;
    public alertData: SendInfoToAlertMessage = {} as SendInfoToAlertMessage;
    private activeFilter: string = 'all';
    private filterName: string = '';
    private subscription: Subscription;
    private filterEvents = new FormControl();
    private unsubscribe$: Subject<void> = new Subject<void>();
    @ViewChild('staticTabs', { static: false }) public staticTab: TabsetComponent;
    @ViewChild('members', { static: false }) child: MembersComponent;
    @ViewChild('sidebar', { static: false }) sidebar: GroupSidebarComponent;
    public isArchivedGroup: boolean = false;
    private zone = moment.tz.guess();
    private worked: boolean = false;
    public groupUnavailable:boolean = false;


    constructor(private _dialog: MatDialog,
                private _activatedRoute: ActivatedRoute,
                private _groupService: GroupService,
                private _subjectService: SubjectsInteractionsService,
                private _router: Router,
                private _cookieService: CookieService,
                private _translate: TranslateService,
                private  metafrenzyService: MetafrenzyService,
                private _utilitesServiec: UtilitesService,
                private cdRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this._activatedRoute.paramMap
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(param => {
                const id = param.get('id');
                if (id) {
                    this.groupId = id;
                    this._getGroupById(this.groupId);
                }
            });
        this.lng = localStorage.getItem('currentLanguage');
        this._translate.get(['archive_group',
            'archive_group_title',
            'archive_group_description',
            'archive_group_event',
            'archive_group_event_title',
            'delete_group_event_desc',
            'archive',
            'all',
            'upcoming',
            'past',
            'page.remove',
            'no-result.no_event_in_group'])
            .subscribe((translated: any) => {
                this.deleteGroupTexts = {
                    header: translated.archive_group,
                    title: translated.archive_group_title,
                    description: translated.archive_group_description,
                    button: translated.archive
                };
                this.deleteEventTexts = {
                    header: translated.archive_group_event,
                    title: translated.archive_group_event_title,
                    description: translated.delete_group_event_desc,
                    button: translated['page.remove']
                };

                if (this.lng === 'fr') {
                    this.title = [
                        {name: 'Tous', value: 'all'},
                        {name: 'A venir', value: 'incoming'},
                        {name: 'Passés', value: 'past'},
                    ];
                } else {
                    this.title = [
                        {name: translated.all, value: 'all'},
                        {name: translated.upcoming, value: 'incoming'},
                        {name: translated.past, value: 'past'},
                    ];
                }

                this.noResult = {
                    'icon': 'icon-calendar',
                    'text': translated['no-result.no_event_in_group']
                };
                this.selectFilter();
                this.filerChange();
            });
        this._checkFileToUpload();
    }

    ngAfterViewChecked() {
        if (this.staticTab && this.staticTab.tabs.length && !this.worked) {
            this.cdRef.detectChanges();
            this.worked = true;
        }
    }

    /**
     * take filter param and pass to filer dropdown
     */
    public selectFilter(): void {
        this.subscription = this._activatedRoute.queryParams.pipe(takeUntil(this.unsubscribe$))
            .subscribe(param => {
                this.events = [];
                this.eventsLimit = 1;
                this.eventsSkip = 0;
                this.activeFilter = param.filter;
                switch (param.filter) {
                    case 'past':
                        this.filterEvents.setValue(this.title[2]);
                        this.getGroupPastUpcomingEvents('past-events');
                        break;
                    case 'all':
                        this.filterEvents.setValue(this.title[0]);
                        this._getGroupEvents(1);
                        break;
                    default :
                        this.filterEvents.setValue(this.title[1]);
                        this.getGroupPastUpcomingEvents('upcoming-events');
                }
            });
    }

    public filerChange(): void {
        this.filterEvents.valueChanges.subscribe(data => {
            const label = document.getElementsByClassName('ui-dropdown-label');
            label[1].textContent = data.name;
            label[0].textContent = data.name;
            this.eventsLimit = 1;
            this.eventsSkip = 0;
            this.eventsOldSkip = null;
            this.events = [];
            this.filterName = data.value;
            switch (this.filterName) {
                case 'past':
                    this._router.navigate([], {
                        relativeTo: this._activatedRoute,
                        queryParams: {
                            filter: 'past'
                        },
                        queryParamsHandling: 'merge',
                        skipLocationChange: true
                    });
                    break;
                case 'all':
                    this._router.navigate([], {
                        relativeTo: this._activatedRoute,
                        queryParams: {
                            filter: 'all'
                        },
                        queryParamsHandling: 'merge',
                        skipLocationChange: true
                    });
                    break;
                default:
                    this._router.navigate([], {
                        relativeTo: this._activatedRoute,
                        queryParams: {
                            filter: 'incoming'
                        },
                        queryParamsHandling: 'merge',
                        skipLocationChange: true
                    });
            }
        });
    }

    private _getGroupById(id: string): void {
        this._groupService.getGroupById(id)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (data: ServerResponse<GroupModel>) => {
                    this.isArchivedGroup = data.data.archive;
                    // mata tags content
                    const metaDescription = data.data.description.length ? data.data.description.slice(0, 255) : this._translate.instant('tags.group_desc');
                    this.metafrenzyService.setTags({
                        title: data.data.name + ' - Jogoto', // setting title and og:title
                        description: metaDescription, // setting meta description and og:description
                        url: `https://jogoto.com/group/${data.data._id}`, // setting canonical and og:url
                        image: data.data.poster.cropped.link // setting og:image:url
                    });
                    // mata tags content end
                    this.autocompletResult = [];
                    if (this.groupData) {
                        this.staticTab.tabs[0].active = true;
                        this.search.reset();
                    }
                    this._sortUsers(data.data);
                    this.checkEventClose();
                    this.showLoadMore = this.groupData.adminsAndModeratorsCount > 2;
                    // fix when users list will be done by request
                    // this.moreMembers = this.groupData.standart_users_count > 6;
                },
                (err: HttpErrorResponse) => {
                    if (err.status === 404) {
                        const localisedRoute = this._utilitesServiec.localizeRouter('/not-found');
                        this._router.navigate([localisedRoute]);
                    } else if ( err.status === 406) {
                        this.groupUnavailable = true;
                    }
                });
    }

    private _sortUsers(data: GroupModel) {
        this.moderatorsAdminsArray = [];
        this.otherMembers = [];
        this.adminsToShow = [];
        this.arr = [];
        this.groupData = data;
        this.checkGroupState = (this.groupData.state && this.groupData.imJoined && this.groupData.group_type === 'closed') || this.groupData.group_type === 'open';
        if (this.groupData.creator._id) {
            this.moderatorsAdminsArray[0] = this.groupData.creator;
        }
        this.moderatorsAdminsArray.push(...this.groupData.moderators, ...this.groupData.admins);
        this.arr = [...this.arr, ...this.moderatorsAdminsArray];
        this.otherMembers = this.groupData.members;
    }

    private _getGroupUsers(limit) {
        this.showLoading = true;
        this._groupService.getGroupUsers(this.othersSkip, limit, this.groupId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((value: ServerResponse<MemberModel[]>) => {
                value.data.map((member) => {
                    this.otherMembers.push(member);
                });
                this.moreMembers = this.otherMembers.length <= this.othersSkip;
                this.showLoading = false;
                this.othersSkip += 6;
            }, err => {
                this.showLoading = false;
            });
    }

    onScroll() {
        if (this.staticTab.tabs[0].active) {
            this.onEventScroll();
        } else {
            this.child.onScroll();
        }
    }

    private _getGroupEvents(limit: number) {
        this._groupService.getGroupEvents(this.eventsSkip, this.eventsLimit, this.groupId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((value: ServerResponse<EventModel[]>) => {
                value.data.map((event) => {
                    this.events.push(event);
                });
                // this._prepareCalendarEvents(this.events);
                this.moreEvents = value.info.count >= this.eventsSkip;
                this.eventLoading = false;
                this.eventsSkip = this.eventsLimit;
                this.eventsLimit += 1;
            }, err => {
                this.eventLoading = false;
            });
    }

    private getGroupPastUpcomingEvents(type) {
        this._groupService.getGroupPastUpcomingEvents(this.eventsSkip, this.eventsLimit, this.groupId, type)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((value: ServerResponse<EventModel[]>) => {
                value.data.map((event) => {
                    this.events.push(event);
                });
                // this._prepareCalendarEvents(this.events);
                this.moreEvents = value.info.count >= this.eventsSkip;
                this.eventLoading = false;
                this.eventsSkip = this.eventsLimit;
                this.eventsLimit += 1;
            }, err => {
                this.eventLoading = false;
            });
    }

    public onEventScroll() {
        this.eventLoading = true;
        if (this.eventsOldSkip !== this.eventsSkip) {
            switch (this.activeFilter) {
                case 'past':
                    this.getGroupPastUpcomingEvents('past-events');
                    break;
                case 'all':
                    this._getGroupEvents(this.eventsLimit);
                    break;
                default :
                    this.getGroupPastUpcomingEvents('upcoming-events');
            }
        }
        this.eventsOldSkip = this.eventsSkip;
    }

    private _prepareCalendarEvents(events: EventModel[]) {
        this.calendarEvents = [];
        const eventsLength = events.length;
        if (eventsLength === 0) {
            return false;
        }

        for (let i = 0; i < eventsLength; i += 1) {
            const dates = events[i].dates;
            for (let j = 0; j < dates.length; j += 1) {
                const calendarEvent = {
                    title: events[i].name,
                    end: dates[j].end,
                    start: dates[j].start,
                    color: !!events[i].category.length ? events[i].category[0].styleData.color : '',
                    eventId: events[i]._id
                };
                this.calendarEvents.push(calendarEvent);
            }
        }
    }

    public getCalendarEvents(event) {
        this._groupService.getGroupCalendarEvents(0, 100, this.groupId, `${event}&zone=${this.zone}`)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((value: ServerResponse<EventModel[]>) => {
                this._prepareCalendarEvents(value.data);
            }, err => {
                this.eventLoading = false;
            });
    }

    public selectUserTab(): void {
        this.staticTab.tabs[2].active = true;
    }

    public openDialogFileUpload(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {};
        dialogConfig.data.type = 'group';
        dialogConfig.data.id = this.groupId;
        const dialogRef = this._dialog.open(ImportFileComponent, dialogConfig);
    }

    public openBlockEventModal() {
        if (this.isAuthorized) {
            const dialogConfig = new MatDialogConfig();
            const blockTexts = {
                header: this._translate.instant('group.block_group_header'),
                title: this._translate.instant('group.block_group_title'),
                description: this._translate.instant('event.block_event_description'),
                button: this._translate.instant('event.block')
            };
            dialogConfig.data = {deleteTexts: blockTexts, id: this.groupId, u_id: this._user_id, type: 'block-group'};
            this._dialog.open(DeleteComponent, dialogConfig);
        } else {
            const localisedUrl = this._utilitesServiec.localizeRouter('/auth/login');
            this._router.navigate([localisedUrl]);
        }
    }

    public checkEventClose() {
        this.showEventClose = (this.groupData.moderator ||
            this.groupData.admin ||
            this.groupData.creator.imCreator);
    }

    private _checkFileToUpload() {
        this._subjectService.uploadedFileState
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((file: UsersFileModel) => {
                if (file) {
                    this.getFileResponse(file);
                }
            });
    }

    public showMoreMembers(value) {
        this.moreMembers = value.moreMembers;
        this.moreSearch = value.moreSearch;
    }

    private getFileResponse(file) {
        this._groupService.sendFile(this.groupData._id, file, 'group')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((value) => {
                this._dialog.closeAll();
                this.alertData.type = 'success';
                this._translate.get('invitations_success').subscribe(translate => {
                    this.alertData.messageText = translate;
                });
                this.alertData.display = true;
                this._subjectService.errorSuccessMessag.next(this.alertData);

            }, err => {
                console.log(err);
            });
    }

    public editGroup() {
        const localisedUrl = this._utilitesServiec.localizeRouter('/basic/create-group');
        this._router.navigate([localisedUrl], {queryParams: {groupId: this.groupId}});
    }

    public removeGroup(deleteTexts, type, eventId?) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {deleteTexts, id: this.groupId, type, eventId, u_id: this._user_id};
        const dialogRef = this._dialog.open(DeleteComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((id) => {
            if (type === 'groupEvent' && id) {
                this.events = this.events.filter((event: EventModel) => {
                    return event._id !== id;
                });
                this.groupData.events = this.events;
                this.groupData.events_count--;
            }
        });
    }

    public getNots() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {groupData: this.groupData.notify, isGroup: true, groupId: this.groupId};
        const dialogRef = this._dialog.open(NotificationSettingsModalComponent, dialogConfig);
        dialogRef.afterClosed()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((result) => {
                if (result) {
                    this.groupData.notify = result;
                }
            });
    }

    public createGroupEvent() {
        const localisedUrl = this._utilitesServiec.localizeRouter('/basic/create-event');
        this._router.navigate([localisedUrl], {queryParams: {groupId: this.groupId}});
    }

    public changeJoin(value: GroupModel): void {
        this.groupData.imJoined = value.imJoined;
        this.groupData.state = value.state;
        value.events = this.events;
        this._subjectService.joinGroup.next(value);
    }

    public updateGroupData(value: GroupModel): void {
        this._subjectService.joinGroup.next(value);
    }

    public followGroup(groupId: string): void {
        if (this.isAuthorized) {
            this.loading = true;
            if (!this.groupData.imJoined) {
                this._groupService.followOrJoinGroup(groupId, this._user_id)
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe((value: ServerResponse<GroupModel>) => {
                        this.loading = false;
                        this.changeJoin(value.data);
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
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe((value) => {
                        this.changeJoin(value.data);
                    });
            }
        } else {
            this.navigate(groupId);
        }
    }

    private deleteUserFromGroup(groupId: string) {
        this._groupService.deleteUserFromGroup(this._user_id, this._user_id, groupId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(value => {
                this.changeJoin(value.data);
                this.loading = false;
            }, err => {
            });
    }

    private navigate(groupId: string) {
        const localisedUrl = this._utilitesServiec.localizeRouter('/auth/login');
        this._router.navigate([localisedUrl],
            {queryParams: {group: groupId}});
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
