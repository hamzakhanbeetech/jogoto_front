import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  HostListener,
} from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { Subject, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie";
import { TranslateService } from "@ngx-translate/core";
import { takeUntil } from "rxjs/operators";
import { MetafrenzyService } from "ngx-metafrenzy";

import { UsersModalComponent } from "../../../shared/components/users-modal/users-modal.component";
import { EventService } from "./event.service";
import {
  EventModel,
  ServerResponse,
  UserModel,
  SendInfoToAlertMessage,
  CheckInterestedOrNot,
} from "../../../models";
import { EventDataModel } from "../initial/initial.models";
import { ShareOnGroupModalComponent } from "../../../shared/components/share-on-group-modal/share-on-group-modal.component";
import { NotificationSettingsModalComponent } from "../../../shared/components/modal/notification-settings-modal/notification-settings-modal.component";
import {
  UtilitesService,
  SubjectsInteractionsService,
} from "../../../services";
import { ReportEventModalComponent } from "../../../shared/components/report-event-modal/report-event-modal.component";
import { AppService } from "../../../../../app.service";
import { InitialService } from "../initial/initial.service";
import { DeleteComponent } from "../../../shared/components/modal/delete/delete.component";
import { GetUserIpService } from "../../../services/get-user-ip.service";
import { environment } from "../../../../../../environments/environment";
import { ContactOrganizorComponent } from "../../../shared/components/modal/contact-organizor/contact-organizor.component";
import _ from "lodash";

declare const google: any;

interface Window {
  HTMLInputElement: typeof HTMLInputElement;
}

@Component({
  selector: "events-view",
  templateUrl: "event.view.html",
  styleUrls: ["event.view.scss"],
})
export class EventView implements OnInit, OnDestroy {
  public eventData: EventModel;
  public _eventId: string;
  public joinedUsers: Array<UserModel>;
  public joinedSixUsers: Array<UserModel>;
  public joinedUsersCount: number;
  public showMoreLessDesc: boolean = false;
  public incomingDate: EventDataModel = null;
  public comeData: any;
  public description: string;
  shortText: string = null;
  public eventInFavoritesOrNot: boolean;
  public whenInterestedOrNot: boolean;
  public showMobile: boolean = false;
  public showDesctop: boolean = true;
  public sendingInfo: SendInfoToAlertMessage;
  private _joinSubscription: Subscription = new Subscription();
  public isSameDay;
  private _showInviteButton: boolean = false;
  private userToken: string = this._cookieService.get("user_token");
  private userId: string = this._cookieService.get("user_id") || "";
  private lang: any;
  public isAuthorized: boolean;
  public selectedValue: string = "all";
  public descriptionIsShort: boolean = true;
  public eventAnavailable: boolean = false;
  public deleteTexts: any;
  public contactOrganizerTexts: any;
  public archiveEvent: boolean;
  public locale: string;
  public limit: number = 0;
  public skip: number = 0;
  public oldSkip: number;
  public eventLoaded: boolean = true;
  public similarEventsCount: number;
  public similarEvents: Array<any> = [];
  public eventLoading: boolean = false;
  private unsubscribe$: Subject<void> = new Subject<void>();
  private translateDescription: boolean = false;

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    if (event.target.innerWidth < 1200) {
      this.showMobile = true;
      this.showDesctop = false;
    } else {
      this.showMobile = false;
      this.showDesctop = true;
    }
  }

  constructor(
    private _dialog: MatDialog,
    private _eventService: EventService,
    private _activatedRoute: ActivatedRoute,
    private _route: Router,
    private _cookieService: CookieService,
    private _utilitesServiec: UtilitesService,
    private _translate: TranslateService,
    private _subjectsInteractionsService: SubjectsInteractionsService,
    private _appService: AppService,
    private _initialService: InitialService,
    private _router: Router,
    private _getUserIpService: GetUserIpService,
    private readonly metafrenzyService: MetafrenzyService
  ) {
    this._checkRouteParams();
    this.isAuthorized = this._appService.getIsAuthorized();
  }

  ngOnInit() {
    this._subjectsInteractionsService.getCurrentLang().subscribe((lang) => {
      this.lang = lang || "en";
    });
    if (window.innerWidth < 1200) {
      this.showMobile = true;
      this.showDesctop = false;
    } else {
      this.showMobile = false;
      this.showDesctop = true;
    }

    this._translate
      .get(
        [
          "archive_event",
          "archive_event_title",
          "archive_event_description",
          "archive",
          "contact_organizer",
          "call_organizer",
          "mail_organizer",
          "contact_organizer_description",
        ],
        [1, 2, 3]
      )
      .subscribe((translated: any) => {
        this.deleteTexts = {
          header: translated.archive_event,
          title: translated.archive_event_title,
          description: translated.archive_event_description,
          button: translated.archive,
        };

        this.contactOrganizerTexts = {
          header: translated.contact_organizer,
          call_organizer: translated.call_organizer,
          mail_organizer: translated.mail_organizer,
          contact_organizer_description:
            translated.contact_organizer_description,
        };
      });

    this._subjectsInteractionsService.afterClickingInterestedOrNotState.subscribe(
      (data: CheckInterestedOrNot) => {
        if (data.interested || data.notInterested) {
          this._getEventByID(this._eventId, false);
        }
      }
    );
    this.checkLang();
  }

  public addDateToCalendarOrNot(event) {
    if (event) {
      this._getEventByID(this._eventId, false);
    }
  }

  public onImageError() {
    this.eventData.poster.cropped.link = `${environment.BASE_URL}img/events/cropped/default.jpeg`;
  }

  private _checkRouteParams(): void {
    this._activatedRoute.params.subscribe((params: { id: string }) => {
      this._eventId = params.id;
      this.eventLoaded = true;
      this._getEventByID(this._eventId);
    });
  }

  public openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { users: this.joinedUsers };
    const dialogRef = this._dialog.open(UsersModalComponent, dialogConfig);
  }

  public openDeleteEventModal(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      deleteTexts: this.deleteTexts,
      id: this._eventId,
      type: "events",
    };
    const dialogRef = this._dialog.open(DeleteComponent, dialogConfig);
  }

  public contactOrganizer($event): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      organizerTexts: this.contactOrganizerTexts,
      phones: (this.eventData.organizer as UserModel).phones,
      email: (this.eventData.organizer as UserModel).email,
    };

    this._dialog.open(ContactOrganizorComponent, dialogConfig);
  }
  public isEmpty(obj) {
    return _.isEmpty(obj);
  }

  public openShareToGroupModal(): void {
    if (this.isAuthorized) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = this.eventData._id;
      const dialogRef = this._dialog.open(
        ShareOnGroupModalComponent,
        dialogConfig
      );
      dialogRef.afterClosed().subscribe(
        (result) => {
          if (result) {
            this.sendingInfo = result;
            this._subjectsInteractionsService.errorSuccessMessag.next({
              type: "success",
              messageText: result,
              display: true,
            });
          }
        },
        (err: any) => {
          this.showError(err);
        }
      );
    } else {
      const localisedUrl = this._utilitesServiec.localizeRouter("/auth/login");
      this._router.navigate([localisedUrl]);
    }
  }

  public openNotificationSettingsModal(): void {
    if (this.isAuthorized) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        result: this.selectedValue,
        eventData: this.eventData,
      };
      const dialogRef = this._dialog.open(
        NotificationSettingsModalComponent,
        dialogConfig
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.eventData.notify = result;
        }
      });
    } else {
      const localisedUrl = this._utilitesServiec.localizeRouter("/auth/login");
      this._router.navigate([localisedUrl]);
    }
  }

  public openReportEventModal(): void {
    if (this.isAuthorized) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = this.eventData;
      const dialogRef = this._dialog.open(
        ReportEventModalComponent,
        dialogConfig
      );
    } else {
      const localisedUrl = this._utilitesServiec.localizeRouter("/auth/login");
      this._router.navigate([localisedUrl]);
    }
  }

  public openBlockEventModal() {
    if (this.isAuthorized) {
      const dialogConfig = new MatDialogConfig();
      const blockTexts = {
        header: this._translate.instant("event.block_event_header"),
        title: this._translate.instant("event.block_event_title"),
        description: this._translate.instant("event.block_event_description"),
        button: this._translate.instant("event.block"),
      };
      dialogConfig.data = {
        deleteTexts: blockTexts,
        id: this._eventId,
        u_id: this.userId,
        type: "block-events",
      };
      this._dialog.open(DeleteComponent, dialogConfig);
    } else {
      const localisedUrl = this._utilitesServiec.localizeRouter("/auth/login");
      this._router.navigate([localisedUrl]);
    }
  }

  public getACategory(id: string): void {
    const localisedRoute = this._utilitesServiec.localizeRouter("/search");
    this._route.navigate([localisedRoute], {
      queryParams: { categories: id, type: "event" },
    });
  }

  public getFilter(ev): void {
    const localisedRoute = this._utilitesServiec.localizeRouter("/search");
    this._route.navigate([localisedRoute], {
      queryParams: { filter: ev.target.value, type: "event" },
    });
  }

  private _getEventByID(id: string, getInterested: boolean = true): void {
    const data = {
      id: id,
      u_id: this.userId,
      user_token: this.userToken,
    };
    this._eventService
      .getEvent(data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        async (data) => {
          // mata tags content
          const metaDescription = data.data.description.slice(0, 255);
          this.metafrenzyService.setTags({
            title: data.data.name + " - Jogoto", // setting title and og:title
            description: metaDescription, // setting meta description and og:description
            url: `https://jogoto.com/event/${data.data._id}`, // setting canonical and og:url
            image: data.data.poster.cropped.link, // setting og:image:url
          });
          this.metafrenzyService.setMetaTag(
            "twitter:image",
            data.data.poster.cropped.link
          );
          this.metafrenzyService.setMetaTag("twitter:title", data.data.name);
          this.metafrenzyService.setMetaTag(
            "twitter:description",
            metaDescription
          );
          // mata tags content end
          this.archiveEvent = await data.data.archive;
          this.eventData = await data.data;
          this.eventData.dates = this._utilitesServiec.checkDateTimeZone(
            this.eventData.dates
          );
          this.setTime();
          if (
            this.eventData.visibility === "public" ||
            (this.eventData.visibility === "private" &&
              this.eventData.event_create_type.is_me === true)
          ) {
            this._showInviteButton = true;
          }
          this.showMoreLessDesc = false;
          this.whenInterestedOrNot = data.data.im_joined;
          this.eventInFavoritesOrNot = data.data.is_favorite;
          this.joinedUsers = this.eventData.joined_users;
          this.joinedUsersCount = this.joinedUsers.length;
          this._getInteresetedUsers(this.joinedUsers);
          this.showShortDesc(this.eventData.description);
        },
        (error) => {
          if (error.status === 404 || error.status === 400) {
            const localisedRoute =
              this._utilitesServiec.localizeRouter("/not-found");
            this._router.navigate([localisedRoute]);
          } else if (error.status === 401 || error.status === 406) {
            this.eventAnavailable = true;
          }
        }
      );
    this.skip = 0;
    this.similarEvents = [];
    if (getInterested) {
      if (window.innerWidth < 1200) {
        this.limit = 2;
        this.getSimilarEvents(id);
      } else {
        this.limit = 3;
        this.getSimilarEvents(id);
      }
    }
  }

  private getSimilarEvents(id): void {
    const data = {
      id: id,
      u_id: this.userId,
      user_token: this.userToken,
      skip: this.skip,
      limit: this.limit,
    };
    this._eventService
      .getSimilarEvents(data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (events) => {
          events.data.map((event) => {
            this.similarEvents.push(event);
          });
          this.similarEventsCount = events.info.count;
          if (window.innerWidth > 1200) {
            this.skip += 3;
          } else {
            this.skip += 2;
          }
          this.eventLoading = false;
        },
        (err) => {
          this.eventLoading = false;
        }
      );
  }

  public onEventLoadend() {
    this.eventLoaded = false;
  }

  public onEventScroll() {
    this.eventLoading = true;
    if (this.oldSkip !== this.skip) {
      this.getSimilarEvents(this._eventId);
    }
    this.oldSkip = this.skip;
  }

  // get users list
  private _getInteresetedUsers(users: Array<UserModel>): void {
    this.joinedSixUsers = users.slice(0, 6);
  }

  public showShortDesc(description: string): void {
    this.description = description;
    this.shortText = null;
    this.descriptionIsShort = true;

    if (this.description.length > 800) {
      this.descriptionIsShort = false;
      let rawText = `${this.description.slice(
        0,
        description.substring(0, 800).lastIndexOf(" ")
      )}...`;
      const fullText = `<span class="d-none">${description.substring(
        rawText.length
      )}</span>`;
      rawText += fullText;
      this.shortText = this._utilitesServiec.checkHashtags(rawText);
    }
    this.description = this._utilitesServiec.checkHashtags(this.description);
  }

  public showMoreLessDescription(): void {
    this.showMoreLessDesc = !this.showMoreLessDesc;
  }

  public async getSortedDateLength(ev: any): Promise<void> {
    this.incomingDate = await ev;
    this.isSameDay =
      !!this.incomingDate &&
      new Date(this.incomingDate["start"]).getMonth() ===
        new Date(this.incomingDate["end"]).getMonth() &&
      new Date(this.incomingDate["start"]).getDate() ===
        new Date(this.incomingDate["end"]).getDate();
    if (ev) {
      this.comeData = {
        date: ev.start,
      };
    } else {
      this.comeData = {};
    }
  }

  private showError(err) {
    if (err.error) {
      this.sendingInfo = {
        type: "error",
        messageText: err.error.error.message,
        display: true,
      };
      this._subjectsInteractionsService.errorSuccessMessag.next(
        this.sendingInfo
      );
    }
  }

  public addEventToFavorites(): void {
    if (this.isAuthorized) {
      if (this.eventData.im_joined) {
        this._eventService
          .addEventToFavorites(this.eventData._id)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(
            (data: ServerResponse<UserModel>) => {
              this.eventInFavoritesOrNot = true;
            },
            (err: any) => {
              this.showError(err);
            }
          );
      } else {
        this._joinSubscription = this._initialService
          .joinToEvent(this._eventId)
          .subscribe(
            (data: ServerResponse<EventModel>) => {
              this._eventService
                .addEventToFavorites(this.eventData._id)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                  (data: ServerResponse<UserModel>) => {
                    this.eventInFavoritesOrNot = true;
                    this._getEventByID(this._eventId);
                  },
                  (err: any) => {
                    this.showError(err);
                  }
                );
            },
            (err: any) => {
              this.showError(err);
            }
          );
      }
    } else {
      const localisedUrl = this._utilitesServiec.localizeRouter("/auth/login");
      this._route.navigate([localisedUrl]);
    }
  }

  public removeEventFromFavorites(): void {
    if (this.isAuthorized) {
      this._eventService
        .removeEventFromFavorites(this.eventData._id, this.userId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((data) => {
          this.eventInFavoritesOrNot = false;
        });
    }
  }

  public getInterestedOrNot(event): void {
    this.whenInterestedOrNot = event;
  }

  public get showInviteButton(): boolean {
    return this._showInviteButton;
  }

  public setTime() {
    const newDare =
      Number(this._cookieService.get("date")) * 1000 * 60 * 60 * 24;
    if (
      document.cookie.length &&
      Number(this._cookieService.get("date")) !== newDare
    ) {
      // console.log(document.cookie);
    } else {
      this._setVisitedIPandTime();
    }
  }

  private _setVisitedIPandTime(): void {
    let date: any = new Date().getTime();
    const viewsCount = this.eventData.views + 1;
    date = Number(date);
    this._getUserIpService
      .getIpAddress()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (res) => {
        const ipaddress = await res["ip"];
        document.cookie = `user_ip=${ipaddress}`;
        document.cookie = `event_id=${this._eventId}`;
        document.cookie = `date=${date}`;
      });
    const body = {
      views: viewsCount,
      ip: this._cookieService.get("user_ip"),
      user_id: this._cookieService.get("user_id"),
    };
    this._eventService
      .updateEventViews(this._eventId, body)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {},
        (err) => {
          console.log(err);
        }
      );
  }

  private checkLang() {
    this._subjectsInteractionsService
      .getCurrentLang()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((lang) => {
        this.locale = lang;
      });
  }

  public googleTranslateElementInit() {
    const data = {
      text: this.eventData.description,
      lang: this.lang,
    };
    this._eventService.translateEventDescription(data).subscribe(
      (date) => {
        this.translateDescription = true;
        this.showShortDesc(date.data.translations[0]);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public showOriginalText() {
    this.translateDescription = false;
    this.showShortDesc(this.eventData.description);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this._joinSubscription.unsubscribe();
  }
}
