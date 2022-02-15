import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from "@angular/core";
import {
  DatesOfEvents,
  EventModel,
  SendInfoToAlertMessage,
} from "../../../models/global.models";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { AppService } from "src/app/app.service";
import { Router, ActivatedRoute } from "@angular/router";
import { EventService } from "../../../views/main/event/event.service";
import { AddToCalendarModalComponent } from "../add-to-calendar-modal/add-to-calendar-modal.component";
import { timer, Subscription } from "rxjs";
import { Subject } from "rxjs";
import {
  SubjectsInteractionsService,
  UtilitesService,
} from "../../../services";
import { GiveFeedbackModalComponent } from "../give-feedback-modal/give-feedback-modal.component";
import { CookieService } from "ngx-cookie";
import { environment } from "../../../../../../environments/environment";
import { TranslateService } from "@ngx-translate/core";
import { AddToCalendarComponent } from "../modal/add-to-calendar/add-to-calendar.component";

@Component({
  selector: "app-event-sidebar",
  templateUrl: "./event-sidebar.component.html",
  styleUrls: ["./event-sidebar.component.scss"],
})
export class EventSidebarComponent implements OnInit, OnDestroy {
  public depricatedDates: Array<DatesOfEvents> = [];
  public passedDates: Array<DatesOfEvents> = [];
  public incomingDate: DatesOfEvents;
  public show: boolean = false;
  public windowLocation = window.location;
  public fbShare = `https://www.facebook.com/sharer/sharer.php?u=`;
  public inShare = `https://www.linkedin.com/shareArticle?mini=true&url=`;
  public twShare = `https://twitter.com/intent/tweet?text=`;
  public sortedDate: Array<DatesOfEvents> = [];
  public newDates: Array<DatesOfEvents> = [];
  public isInterested: boolean;
  public latLng: any;
  public isAuthorized: boolean;
  public sendingInfo: SendInfoToAlertMessage = {} as SendInfoToAlertMessage;
  public isShowAlert: boolean = false;
  private _joinToEventSubscription: Subscription = new Subscription();
  public eventData: EventModel;
  public hostLink: string;
  public archive: boolean;
  @Output() checkInterestedForNotificationSetting = new EventEmitter();
  @Output() whenAddDateToCalendar = new EventEmitter();

  @Input("eventData")
  set eventDataSet($event) {
    this.windowLocation = window.location;
    this.eventData = $event;
    this.hostLink = EventSidebarComponent.checkUserType(this.eventData);
    this.archive = $event.archive;
    this.setDatas();
  }

  @Input("isPreview") public isPreview: boolean = false;
  @Input("locale") public locale: string;

  public subject = new Subject<any>();
  @Output() public sortedEventDate = new EventEmitter();

  constructor(
    private _subjectsInteractionsService: SubjectsInteractionsService,
    private _activatedRoute: ActivatedRoute,
    private _dialog: MatDialog,
    private _appService: AppService,
    private _translate: TranslateService,
    private _router: Router,
    private _eventService: EventService,
    private _utilities: UtilitesService,
    private _cookieService: CookieService
  ) {
    this.isAuthorized = this._appService.getIsAuthorized();
  }

  ngOnInit() {
    this._translate.get("event.remove_message").subscribe((translated) => {
      this.sendingInfo.messageText = translated;
    });
  }

  setDatas() {
    this._sortDates(this.eventData.dates);
    this.isInterested = this.eventData.im_joined;
    this.latLng = `${this.eventData.location.coordinates[0]},${this.eventData.location.coordinates[1]}`;
  }

  static checkUserType(event: EventModel): string {
    return event.me_invited_user.register_type === "individual"
      ? "/user/" + event.me_invited_user._id
      : "/organization/" + event.me_invited_user._id;
  }

  public openGiveFeedbackModal(): void {
    if (this.isAuthorized) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = this.eventData._id;
      const dialogRef = this._dialog.open(
        GiveFeedbackModalComponent,
        dialogConfig
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.sendingInfo.type = "success";
          // this.sendingInfo.messageText = 'Your feedback successfully sent';
          this.sendingInfo.display = true;
          this._subjectsInteractionsService.errorSuccessMessag.next(
            this.sendingInfo
          );
          this._subjectsInteractionsService.afterClickingInterestedOrNot.next({
            interested: false,
            notInterested: true,
          });
          timer(2000).subscribe(() => {
            this.isShowAlert = false;
            this.isInterested = false;
            this.checkInterestedForNotificationSetting.emit(this.isInterested);
          });
        }
      });
    } else {
      const localisedUrl = this._utilities.localizeRouter("/auth/login");
      this._router.navigate([localisedUrl]);
    }
  }

  public openAddToCalendarModal(): void {
    if (this.isAuthorized) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = this.eventData;
      dialogConfig.data.lang = this._translate.currentLang;
      const dialogRef = this._dialog.open(
        AddToCalendarModalComponent,
        dialogConfig
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this._joinToEventSubscription = this._eventService
            .joinToEvent(this.eventData._id, result)
            .subscribe((response) => {
              localStorage.setItem("user_data", JSON.stringify(response.data));
              this.isInterested = true;
              this.eventData.user_calendar = result;
              this.whenAddDateToCalendar.emit(this.isInterested);
            });
        }
      });
    } else {
      const localisedUrl = this._utilities.localizeRouter("/auth/login");
      this._router.navigate([localisedUrl]);
    }
  }

  private _sortDates(dates): Array<DatesOfEvents> {
    this.newDates = [];
    this.passedDates = [];
    this.depricatedDates = [];

    dates.map((date) => {
      if (new Date(date.start) < new Date()) {
        this.passedDates.push(date);
      }
    });
    this.sortedDate = dates.sort((a, b) => {
      const dateA: any = new Date(a.start);
      const dateB: any = new Date(b.start);
      return dateA - dateB;
    });

    this.sortedDate.map((date) => {
      if (new Date(date.start) >= new Date()) {
        this.newDates.push(date);
      } else {
        this.depricatedDates.push(date);
      }
    });

    this.incomingDate = this.newDates[0];
    if (this.incomingDate) {
      this.sortedEventDate.emit(this.incomingDate);
    } else {
      this.sortedEventDate.emit(null);
    }
    return this.newDates, this.depricatedDates;
  }

  public onClickInterestedButton(): void {
    if (this.isAuthorized) {
      if (this.incomingDate) {
        if (!this.isInterested) {
          // do you want to add to jogot Calendar

          const dialogRef = this._dialog.open(AddToCalendarComponent, {
            data: {
              message: "Are you sure want to delete?",
              buttonText: {
                ok: "Save",
                cancel: "No",
              },
            },
          });

          dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
              this.openAddToCalendarModal();
            }
          });

          this._joinToEventSubscription = this._eventService
            .joinToEvent(this.eventData._id)
            .subscribe((response) => {
              this.isInterested = true;
              this.checkInterestedForNotificationSetting.emit(
                this.isInterested
              );
              this._subjectsInteractionsService.afterClickingInterestedOrNot.next(
                { interested: true, notInterested: false }
              );
            });
        }
      } else {
        this._showErr();
      }
    } else {
      const localisedUrl = this._utilities.localizeRouter("/auth/login");
      this._router.navigate([localisedUrl], {
        queryParams: { event: this.eventData._id },
      });
    }
  }

  private _showErr() {
    this.sendingInfo = {
      type: "error",
      messageText: this._translate.instant("event.event_passed_mess"),
      display: true,
    };
    this._subjectsInteractionsService.errorSuccessMessag.next(this.sendingInfo);
  }

  get userId(): string {
    return this._cookieService.get("user_id") || "";
  }

  ngOnDestroy() {
    this._joinToEventSubscription.unsubscribe();
  }
}
