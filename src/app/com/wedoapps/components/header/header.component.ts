import { Subject, Subscription, timer } from "rxjs";
import { CookieService } from "ngx-cookie";
import { Router, RoutesRecognized } from "@angular/router";
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  AfterViewInit,
} from "@angular/core";

import {
  SubjectsInteractionsService,
  UserService,
  SocketService,
  GoogleApiService,
  UtilitesService,
} from "../../services";
import { ServerResponse, UserDataModel } from "../../models/global.models";
import { UserTypeConstants } from "../../constants/user.constants";
import { INotification } from "../../models/notification.models";
import { MainService } from "../../views/main/main.service";
import { AppService } from "../../../../app.service";
import { switchMap, takeUntil } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userImage: string;
  public userName: string;
  public searchIcon: boolean = true;
  public userId = this._cookieService.get("user_id");
  public UserType = UserTypeConstants;
  public notifications: INotification[] = [];
  public notificationsCount: number = 0;
  public newNotifications: number = 0;
  public isLoadingChildLoader: boolean = true;
  public year = new Date().getFullYear();
  private unsubscribe$: Subject<void> = new Subject<void>();
  private skip: number = 0;
  private limit: number = 6;
  private isOpenNotifications: boolean = false;
  private isAuthorized = true;
  public lat: number;
  public lon: number;
  public place: string;
  public defaultDates: any;
  public locale: string;

  constructor(
    private _cookieService: CookieService,
    private _translate: TranslateService,
    private _router: Router,
    private _mainService: MainService,
    private _appService: AppService,
    private _googleApi: GoogleApiService,
    private _userService: UserService,
    private cdRef: ChangeDetectorRef,
    private utilitesService: UtilitesService,
    private _subjectsIteractionsService: SubjectsInteractionsService
  ) {}

  ngOnInit() {
    let lang = localStorage.getItem("currentLanguage");
    this.checkLang();
    this.defaultDates = this.utilitesService.getDefaultDates();
    if (this._router.url === "/" || this._router.url.match("/search")) {
      this.searchIcon = false;
    } else {
      this.searchIcon = true;
      this.getLocation();
    }
    this._router.events
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (event) => {
        // example: NavigationStart, RoutesRecognized, NavigationEnd
        if (event instanceof RoutesRecognized) {
          if (event.url === "/" || event.url.match("/search")) {
            this.searchIcon = false;
          } else {
            this.searchIcon = true;
            this.getLocation();
          }
        }
      });
    this.userImage = this._getUserData().poster.min;
    this.userName = `${this._getUserData().name} ${
      this._getUserData().surname
    }`;
    this._subjectsIteractionsService.$changeImageSubject
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data.link) {
          if (data.hasChanged) {
            this.userImage = "";
          }

          this.userImage = data.link;
          this.cdRef.detectChanges();
          const userData = this._getUserData();
          userData.poster.min = data.link;
          localStorage.setItem("user_data", JSON.stringify(userData));
        }
      });

    // timer(0, 5000).pipe(
    //   takeUntil(this.unsubscribe$),
    //   switchMap(() => {
    //     if (this.isAuthorized)
    //       return this._userService.getNotificationCount()
    //   })
    // ).subscribe(res => {
    //   if (res.data.language !== lang) {
    //     lang = res.data.language;
    //     // this._translate.use(lang);
    //   }
    //   this.newNotifications = res.data.notificationsCount;
    // });
  }

  private checkLang() {
    this._subjectsIteractionsService
      .getCurrentLang()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((lang) => {
        this.locale = lang;
      });
  }

  private getMoreNotifications(skip, limit): void {
    this._userService.getNotifications(skip, limit).subscribe(
      (res) => {
        const temp = [...this.notifications];
        temp.push(...res.data);
        this.notifications = temp;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  public getUserNotifications(type: string = ""): void {
    if (!this.isOpenNotifications || type) {
      if (type === "more") {
        this.skip += 5;
        this.getMoreNotifications(this.skip, this.limit);
      } else {
        this.skip = 0;
        this.notifications = [];
        this.newNotifications = 0;

        this._userService.getNotifications(this.skip, this.limit).subscribe(
          (res) => {
            this.notifications = res.data;
            this.notificationsCount = res.info.all_count;
            this.isLoadingChildLoader = !this.isLoadingChildLoader;
          },
          (err) => {
            console.log(err);
          }
        );
      }
    } else {
      this.isLoadingChildLoader = !this.isLoadingChildLoader;
    }
    this.isOpenNotifications = !this.isOpenNotifications;
  }

  public acceptOrDeclineInvitation(event: any): void {
    let body;
    if (event.eventType === "accept") {
      switch (event.type) {
        case "event":
          body = {
            event_id: event._id,
          };

          this.joinOrDecline("acceptToJoinEvent", body, event._id);
          break;
        case "group":
          body = {
            group_id: event._id,
            user_id: event.userId,
          };

          const eventName = event.needAcception
            ? "acceptToJoinGroupAsAdmin"
            : "acceptToJoinGroupInvite";
          this.joinOrDecline(eventName, body, event._id);
          break;
        case "page":
          body = {
            page_id: event._id,
          };

          this.joinOrDecline("acceptToJoinPageInvite", body, event._id);
          break;
        default:
          return;
      }
    } else {
      switch (event.type) {
        case "event":
          body = {
            event_id: event._id,
          };

          this.joinOrDecline("declineToJoinEvent", body, event._id);
          break;
        case "group":
          body = {
            group_id: event._id,
            user_id: event.userId,
          };

          const eventName = event.needAcception
            ? "declineToJoinGroupInviteAsAdmin"
            : "declineToJoinGroupInvite";
          this.joinOrDecline(eventName, body, event._id);
          break;
        case "page":
          body = event._id;

          this.joinOrDecline("declineToJoinPageInvite", body, event._id);
          break;
        default:
          return;
      }
    }
  }

  public markAsRead(ev) {
    if (ev.markAll) {
      this.markAllAsRead(this.userId);
    } else {
      this.markAsReadById(ev.id, this.userId, ev.index);
    }
  }

  private markAllAsRead(id) {
    this._userService.markAllAsRead(id).subscribe(
      (res) => {
        this.notifications.forEach((notification) => {
          if (!notification.read) {
            notification.read = !notification.read;
          }
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  private markAsReadById(id, uId, index) {
    this._userService.markAsReadById(id, uId).subscribe(
      (res) => {
        this.notifications[index].read = true;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public joinOrDecline(eventName: string, body: any, id: string): void {
    this._userService[eventName](body).subscribe(
      (res) => {
        this.notifications = this.notifications.filter((notify) => {
          return notify.data_id !== id;
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public removeNotification(id: string): void {
    this._userService.deleteNotification(id).subscribe(
      (res) => {
        this.notifications = this.notifications.filter((notification) => {
          return notification._id !== id;
        });
        if (this.notificationsCount > 0) {
          this.notificationsCount -= 1;
        }
        if (this.notificationsCount !== this.notifications.length) {
          this.getMoreNotifications(this.notifications.length, 1);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public onClickSignOut(): void {
    this._mainService
      .getUsersLogOut()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ServerResponse<{}>) => {
        this._cookieService.removeAll();
        this.isAuthorized = false;
        this._appService.setIsAuthorized(false);
        localStorage.clear();
        this._subjectsIteractionsService.authorization.next({
          isAuthorized: false,
        });
        this._subjectsIteractionsService.changeUserState(false);
        const localisedUrl = this.utilitesService.localizeRouter("");
        this._router.navigate([localisedUrl]);
        window.scrollTo(0, 0);
      });
  }

  public _getUserData(): UserDataModel {
    return JSON.parse(localStorage.getItem("user_data"));
  }

  public clickOutside(): void {
    if (this.isOpenNotifications) {
      this.isOpenNotifications = !this.isOpenNotifications;
      this.isLoadingChildLoader = true;
      this.skip = 0;
      this.notifications = [];
    }
  }

  private getLocation() {
    if (!this.lat) {
      this._googleApi.getUserLocation
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((location) => {
          if (location) {
            if (!!location.place) {
              this.lat = location.lat;
              this.lon = location.lon;
              this.place = location.place;
            } else {
              this.getPlace(location.lat, location.lon);
            }
          }
        });
    }
  }

  private getPlace(lat, lon) {
    this._googleApi
      .findPlaceByCoordinates(lat, lon)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ value }) => {
        this.lat = lat;
        this.lon = lon;
        this.place = value;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
