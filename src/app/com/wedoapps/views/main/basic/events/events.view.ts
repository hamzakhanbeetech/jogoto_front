import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { EventsService } from "./events.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TabsetComponent } from "ngx-bootstrap";
import {
  EventModel,
  NoResultModel,
  ServerResponse,
  UserInfoModel,
} from "../../../../models";
import { FormControl } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { debounceTime, take, takeUntil } from "rxjs/operators";
import { CookieService } from "ngx-cookie";
import { SubjectsInteractionsService } from "../../../../services";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { DeleteComponent } from "../../../../shared/components/modal/delete/delete.component";
import { EventService } from "../../event/event.service";

@Component({
  selector: "app-events",
  templateUrl: "./events.view.html",
  styleUrls: ["./events.view.scss"],
})
export class EventsView implements OnInit, OnDestroy {
  public title: Array<object>;
  public eventsListInterested: Array<EventModel> = [];
  private firsEventsListInterested: Array<EventModel> = [];
  public eventsListFavorited: Array<EventModel> = [];
  private firsEventsListFavorites: Array<EventModel> = [];
  public eventsListCreated: Array<EventModel> = [];
  private firsEventsListCreated: Array<EventModel> = [];
  public eventsListArchive: Array<EventModel> = [];
  private firsEventsListArchive: Array<EventModel> = [];
  public eventsInfo: any;
  public isLoadingInterested: boolean = true;
  public isLoadingFavorites: boolean = true;
  public isLoadingCreated: boolean = true;
  public isLoadingArchive: boolean = true;
  public limitInterested: number = 8;
  public limitInterestedSearch: number = 8;
  public limitFavorites: number = 8;
  public limitFavoritesSearch: number = 8;
  public limitCreated: number = 8;
  public limitCreatedSearch: number = 8;
  public limitArchive: number = 8;
  public limitArchiveSearch: number = 8;
  public resetBtn: boolean = false;
  public noResult: NoResultModel;
  public noResultBlock: boolean = false;
  public interestedCount: number = 0;
  public favoritesCount: number = 0;
  public createdCount: number = 0;
  public archiveCount: number = 0;
  public userInfo: UserInfoModel;
  private filterEvents = new FormControl();
  private filterName: string = "";
  public tabName: string = "";
  private filterType: string = "";
  private userId = this._activatedRoute.snapshot.paramMap.get("id");
  public activeTab: string = "";
  public inputValue: string = "";
  private eventsSearchCount: number;
  private subscription: Subscription;
  private createdSearchCount: number;
  private favoritesEventsCount: number;
  private archiveEventsCount: number;
  public autorizatedUser: boolean = false;
  public lng: string;
  public deleteEventTexts: any;
  private deleteEventReady: boolean = true;
  private listenerWorked: boolean = false;
  private unsubscribe$: Subject<void> = new Subject<void>();

  @ViewChild("eventsTabs", { static: true }) eventsTabs: TabsetComponent;

  @ViewChild("searchText", { static: true }) searchText: ElementRef;

  constructor(
    private translate: TranslateService,
    private _eventsService: EventsService,
    private _eventService: EventService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _cookieService: CookieService,
    private _subject: SubjectsInteractionsService,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this.lng = localStorage.getItem("currentLanguage");
    this.translate
      .get([
        "delete_event",
        "delete_event_title",
        "delete_event_description",
        "delete",
      ])
      .subscribe((translated: any) => {
        this.deleteEventTexts = {
          header: translated.delete_event,
          title: translated.delete_event_title,
          description: translated.delete_event_description,
          button: translated.delete,
        };
      });
    if (this._cookieService.get("user_id") === this.userId) {
      this.autorizatedUser = true;
    }

    this.noSearchResults();
    this.translate.get(["all", "upcoming", "past"]).subscribe((translated) => {
      if (this.lng === "fr") {
        this.title = [
          { name: "Tous", value: "all" },
          { name: "A venir", value: "incoming" },
          { name: "Passés", value: "past" },
        ];
      } else {
        this.title = [
          { name: translated.all, value: "all" },
          { name: translated.upcoming, value: "incoming" },
          { name: translated.past, value: "past" },
        ];
      }
      this.filerChange();
      this.selectFilter();
    });
    this._subject.pageTags.next({
      title: `tags.events_title`,
      desc: `tags.events_desc`,
    });
    this._activatedRoute.paramMap
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((param: any) => {
        if (this.userId != param.params.id) {
          this.userId = param.params.id;
          this.autorizatedUser =
            this._cookieService.get("user_id") === this.userId;
          this.selectUserTabPanel();
        }
      });
  }

  /**
   * take filter param and pass to filer dropdown
   */
  public selectFilter(): void {
    this.subscription = this._activatedRoute.queryParams
      .pipe(take(1))
      .subscribe((param) => {
        this.tabName = param.type;
        this.activeTab = param.type;
        this.filterType = param.filter;
        this.filterName = param.filter;
        this.listenerWorked = true;
        if (
          this.tabName === undefined ||
          !this.tabName ||
          (!this.autorizatedUser && this.tabName === "archived")
        ) {
          this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: {
              type: "interested",
              filter: param.filter,
            },
            queryParamsHandling: "merge",
          });
        }
        if (param.filter === "past") {
          this.filterEvents.setValue(this.title[2]);
        } else if (param.filter === "all") {
          this.filterEvents.setValue(this.title[0]);
        } else {
          this.filterEvents.setValue(this.title[1]);
        }
        switch (param.filter) {
          case "past":
            this._router.navigate([], {
              relativeTo: this._activatedRoute,
              queryParams: {
                filter: "past",
              },
              queryParamsHandling: "merge",
            });
            break;
          case "all":
            this._router.navigate([], {
              relativeTo: this._activatedRoute,
              queryParams: {
                filter: "all",
              },
              queryParamsHandling: "merge",
            });
            break;
          default:
            this._router.navigate([], {
              relativeTo: this._activatedRoute,
              queryParams: {
                filter: "incoming",
              },
              queryParamsHandling: "merge",
            });
        }
        this.selectUserTabPanel();
      });
  }

  public filerChange(): void {
    this.filterEvents.valueChanges.subscribe((data) => {
      if (!this.listenerWorked) {
        this.filterName = data.value;
        switch (this.filterName) {
          case "past":
            this._router.navigate([], {
              relativeTo: this._activatedRoute,
              queryParams: {
                filter: "past",
              },
              queryParamsHandling: "merge",
            });
            break;
          case "all":
            this._router.navigate([], {
              relativeTo: this._activatedRoute,
              queryParams: {
                filter: "all",
              },
              queryParamsHandling: "merge",
            });
            break;
          default:
            this._router.navigate([], {
              relativeTo: this._activatedRoute,
              queryParams: {
                filter: "incoming",
              },
              queryParamsHandling: "merge",
            });
        }
        if (this.inputValue.length === 0) {
          switch (this.activeTab) {
            case "interested":
              this.eventsListInterested = [];
              this.limitInterested = 8;
              this.isLoadingInterested = true;
              break;
            case "favorites":
              this.eventsListFavorited = [];
              this.limitFavorites = 8;
              this.isLoadingFavorites = true;
              break;
            case "created":
              this.eventsListCreated = [];
              this.limitCreated = 8;
              this.isLoadingCreated = true;
              break;
          }
          this.selectUserTabPanel();
        } else {
          switch (this.activeTab) {
            case "interested":
              this.eventsListInterested = [];
              this.limitInterestedSearch = 8;
              this.isLoadingInterested = true;
              this.search();
              break;
            case "favorites":
              this.eventsListFavorited = [];
              this.limitFavoritesSearch = 8;
              this.isLoadingFavorites = true;
              this.search();
              break;
            case "created":
              this.eventsListCreated = [];
              this.limitCreatedSearch = 8;
              this.isLoadingCreated = true;
              this.search();
              break;
          }
        }
      } else {
        this.listenerWorked = false;
      }
    });
  }

  public noSearchResults(): void {
    if (!this.searchText.nativeElement.value) {
      this.translate
        .get("no-result.no_events_show")
        .subscribe((translated: string) => {
          this.noResult = {
            icon: "icon-calendar",
            text: translated,
          };
        });
    } else {
      this.translate
        .get("no-result.no_results_for")
        .subscribe((translated: string) => {
          this.noResult = {
            icon: "icon-calendar",
            text: `${translated}`,
          };
        });
    }
  }

  public async selectUserTabPanel() {
    this.listenerWorked = true;
    switch (await this.tabName) {
      case "interested":
        this.eventsTabs.tabs[0].active = true;
        this.getUserInterestedEvents("interested", this.limitInterested, 0);
        break;
      case "favorites":
        this.eventsTabs.tabs[1].active = true;
        this.getUserInterestedEvents("favorites", this.limitFavorites, 0);
        break;
      case "created":
        this.eventsTabs.tabs[2].active = true;
        this.getUserInterestedEvents("created", this.limitCreated, 0);
        break;
      case "archived":
        if (this.autorizatedUser && this.eventsTabs.tabs[3]) {
          this.eventsTabs.tabs[3].active = true;
          this.getUserInterestedEvents("archive", this.limitArchive, 0);
        }
    }
  }

  public tabEventsFromClick(e) {
    if (this.activeTab !== e) {
      switch (e) {
        case "interested":
          this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: {
              type: "interested",
              filter: this.filterName || "incoming",
            },
            queryParamsHandling: "merge",
          });
          this.isLoadingInterested = true;
          this.eventsListInterested = [];
          break;
        case "favorites":
          this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: {
              type: "favorites",
              filter: this.filterName || "incoming",
            },
            queryParamsHandling: "merge",
          });
          this.isLoadingFavorites = true;
          this.eventsListFavorited = [];
          break;
        case "created":
          this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: {
              type: "created",
              filter: this.filterName || "incoming",
            },
            queryParamsHandling: "merge",
          });
          this.isLoadingCreated = true;
          this.eventsListCreated = [];
          break;
        case "archived":
          if (this.autorizatedUser) {
            this._router.navigate([], {
              relativeTo: this._activatedRoute,
              queryParams: {
                type: "archived",
                filter: this.filterName || "incoming",
              },
              queryParamsHandling: "merge",
            });
            this.isLoadingArchive = true;
            this.eventsListArchive = [];
          }
          break;
      }
      this.searchText.nativeElement.value = null;
      this.activeTab = e;
      this.selectUserTabPanel();
    }
  }

  public onScroll() {
    if (this.activeTab === "") {
      this.activeTab = "interested";
    }
    if (this.inputValue.length === 0) {
      switch (this.activeTab) {
        case "interested":
          this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: {
              type: "interested",
            },
            queryParamsHandling: "merge",
          });
          if (this.eventsListInterested.length < this.interestedCount) {
            this.limitInterested += this.limitInterested;
            this.selectUserTabPanel();
          } else {
            this.isLoadingInterested = false;
          }
          break;
        case "favorites":
          if (this.eventsListFavorited.length < this.favoritesCount) {
            this.limitFavorites += this.limitFavorites;
            this.selectUserTabPanel();
          } else {
            this.isLoadingFavorites = false;
          }
          break;
        case "created":
          if (this.eventsListCreated.length < this.createdCount) {
            this.limitCreated += this.limitCreated;
            this.selectUserTabPanel();
          } else {
            this.isLoadingCreated = false;
          }
          break;
        case "archived":
          if (this.eventsListArchive.length < this.archiveCount) {
            this.limitArchive += this.limitArchive;
            this.selectUserTabPanel();
          } else {
            this.isLoadingArchive = false;
          }
          break;
      }
    } else {
      switch (this.activeTab) {
        case "interested":
          if (this.eventsListInterested.length < this.eventsSearchCount) {
            this.limitInterestedSearch += this.limitInterestedSearch;
            this.searchResult();
          } else {
            this.isLoadingInterested = false;
          }
          break;
        case "favorites":
          if (
            this.eventsListFavorited.length < this.eventsInfo.createdSearchCount
          ) {
            this.limitFavoritesSearch += this.limitFavoritesSearch;
            this.searchResult();
          } else {
            this.isLoadingFavorites = false;
          }
          break;
        case "created":
          if (
            this.eventsListCreated.length < this.eventsInfo.favoritesEventsCount
          ) {
            this.limitCreatedSearch += this.limitCreatedSearch;
            this.searchResult();
          } else {
            this.isLoadingCreated = false;
          }
          break;
        case "archived":
          if (this.eventsListArchive.length < this.eventsInfo.archiveCount) {
            this.limitArchiveSearch += this.limitArchiveSearch;
            this.searchResult();
          } else {
            this.isLoadingArchive = false;
          }
          break;
      }
    }
  }

  public reset() {
    this.searchText.nativeElement.value = null;
    this.resetBtn = false;
    this.noResultBlock = false;
    this.selectUserTabPanel();
  }

  public async search() {
    this.inputValue = await this.searchText.nativeElement.value;
    if (this.inputValue.length > 0) {
      this.resetBtn = true;
      if (this.eventsTabs.tabs[0].active) {
        this.firsEventsListInterested = [];
        this.eventsListInterested = [];
        this.isLoadingInterested = true;
        this.searchResult();
      } else if (this.eventsTabs.tabs[1].active) {
        this.firsEventsListFavorites = [];
        this.eventsListFavorited = [];
        this.isLoadingFavorites = true;
        this.searchResult();
      } else if (this.eventsTabs.tabs[2].active) {
        this.firsEventsListCreated = [];
        this.eventsListCreated = [];
        this.isLoadingCreated = true;
        this.searchResult();
      } else if (this.eventsTabs.tabs[3].active) {
        this.firsEventsListArchive = [];
        this.eventsListArchive = [];
        this.isLoadingArchive = true;
        this.searchResult();
      }
    } else {
      this.resetBtn = false;
      this.noResultBlock = false;
      if (this.eventsTabs.tabs[0].active) {
        this.firsEventsListInterested = [];
        this.eventsListInterested = [];
        this.searchResult();
      } else if (this.eventsTabs.tabs[1].active) {
        this.firsEventsListFavorites = [];
        this.eventsListFavorited = [];
        this.selectUserTabPanel();
      } else if (this.eventsTabs.tabs[2].active) {
        this.firsEventsListCreated = [];
        this.eventsListCreated = [];
        this.selectUserTabPanel();
      } else if (this.eventsTabs.tabs[3].active) {
        this.firsEventsListArchive = [];
        this.eventsListArchive = [];
        this.selectUserTabPanel();
      }
    }
  }

  public searchResult() {
    this.resetBtn = true;
    if (this.eventsTabs.tabs[0].active) {
      this.searchUserEvents(
        "interested",
        this.inputValue,
        0,
        this.limitInterestedSearch
      );
    } else if (this.eventsTabs.tabs[1].active) {
      this.searchUserEvents(
        "favorites",
        this.inputValue,
        0,
        this.limitFavoritesSearch
      );
    } else if (this.eventsTabs.tabs[2].active) {
      this.searchUserEvents(
        "create",
        this.inputValue,
        0,
        this.limitCreatedSearch
      );
    } else if (this.eventsTabs.tabs[3].active) {
      this.searchUserEvents(
        "archive",
        this.inputValue,
        0,
        this.limitArchiveSearch
      );
    }
  }

  public getUserInterestedEvents(type, limit, offset): void {
    this._eventsService
      .getUserInterestedEvents(
        this.userId,
        this.filterName,
        type,
        offset,
        limit
      )
      .pipe(debounceTime(200))
      .subscribe(
        (data) => {
          this.interestedCount = data.info.interestedCount;
          this.favoritesCount = data.info.favoritesCount;
          this.createdCount = data.info.createdCount;
          this.archiveCount = data.info.archiveCount;
          this.userInfo = data.info.user_data;
          if (!data.data.length) {
            this.noSearchResults();
          }
          this.listenerWorked = false;
          this.eventsInfo = data.info;
          switch (type) {
            case "interested":
              this.firsEventsListInterested = data.data;
              this.eventsListInterested = this.firsEventsListInterested;
              if (
                this.interestedCount > this.limitInterested &&
                data.data.length
              ) {
                this.isLoadingInterested = true;
              } else {
                this.isLoadingInterested = false;
              }
              break;
            case "favorites":
              this.firsEventsListFavorites = data.data;
              this.eventsListFavorited = this.firsEventsListFavorites;
              if (
                this.favoritesCount > this.limitFavorites &&
                data.data.length
              ) {
                this.isLoadingFavorites = true;
              } else {
                this.isLoadingFavorites = false;
              }
              break;
            case "created":
              this.firsEventsListCreated = data.data;
              this.eventsListCreated = this.firsEventsListCreated;
              if (this.createdCount > this.limitCreated && data.data.length) {
                this.isLoadingCreated = true;
              } else {
                this.isLoadingCreated = false;
              }
              break;
            case "archive":
              this.firsEventsListArchive = data.data;
              this.eventsListArchive = this.firsEventsListArchive;
              if (this.archiveCount > this.limitArchive && data.data.length) {
                this.isLoadingArchive = true;
              } else {
                this.isLoadingArchive = false;
              }
          }
        },
        (err) => console.log(err)
      );
  }

  public searchUserEvents(type, name, offset, limit): void {
    this._eventsService
      .searchUserEvents(this.userId, this.filterName, type, name, offset, limit)
      .pipe(debounceTime(200))
      .subscribe(
        (data) => {
          if (!data.data.length) {
            this.noSearchResults();
            this.noResultBlock = true;
          } else {
            this.noResultBlock = false;
          }
          switch (type) {
            case "interested":
              this.firsEventsListInterested = data.data;
              this.eventsSearchCount = data.info.eventsSearchCount;
              this.eventsListInterested = this.firsEventsListInterested;
              if (this.eventsSearchCount > this.limitInterestedSearch) {
                this.isLoadingInterested = true;
              } else {
                this.isLoadingInterested = false;
              }
              break;
            case "favorites":
              this.firsEventsListFavorites = data.data;
              this.favoritesEventsCount = data.info.favoritesEventsCount;
              this.eventsListFavorited = this.firsEventsListFavorites;
              if (this.eventsSearchCount > this.limitFavoritesSearch) {
                this.isLoadingFavorites = true;
              } else {
                this.isLoadingFavorites = false;
              }
              break;
            case "create":
              this.firsEventsListCreated = data.data;
              this.createdSearchCount = data.info.createdSearchCount;
              this.eventsListCreated = this.firsEventsListCreated;
              if (this.eventsSearchCount > this.limitCreatedSearch) {
                this.isLoadingCreated = true;
              } else {
                this.isLoadingCreated = false;
              }
              break;
            case "archive":
              this.firsEventsListArchive = data.data;
              this.archiveEventsCount = data.info.archiveCount;
              this.eventsListCreated = this.firsEventsListArchive;
              if (this.eventsSearchCount > this.limitArchiveSearch) {
                this.isLoadingArchive = true;
              } else {
                this.isLoadingArchive = false;
              }
          }
        },
        (err) => console.log(err)
      );
  }

  public deleteEvent(event, type = "delete") {
    if (this.deleteEventReady) {
      this.deleteEventReady = false;
      if (type == "delete") {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          deleteTexts: this.deleteEventTexts,
          id: event._id,
          type: "events/remove",
          eventId: event._id,
          u_id: this.userId,
        };
        const dialogRef = this._dialog.open(DeleteComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((id) => {
          if (this.tabName === "created") {
            this.eventsListCreated = this.eventsListCreated.filter(
              (eventM: EventModel) => {
                return eventM._id !== event._id;
              }
            );
            this.createdCount--;
          } else {
            this.eventsListArchive = this.eventsListArchive.filter(
              (event: EventModel) => {
                return event._id !== id;
              }
            );
          }
          this.deleteEventReady = true;
        });
      } else if (type == "favorit") {
        this._eventService
          .removeEventFromFavorites(event._id, this.userId)
          .subscribe((data) => {
            this.eventsListFavorited = this.eventsListFavorited.filter(
              (item) => {
                return item._id != event._id;
              }
            );
            this.favoritesCount--;
            this.getUserInterestedEvents("favorites", this.limitFavorites, 0);
            this.deleteEventReady = true;
          });
      } else {
        this._eventService.unJoinToEvent(event._id, "not interested").subscribe(
          (data: ServerResponse<EventModel>) => {
            this.eventsListInterested = this.eventsListInterested.filter(
              (item) => {
                return item._id != event._id;
              }
            );
            --this.interestedCount;
            this.getUserInterestedEvents("interested", this.limitInterested, 0);
            this.deleteEventReady = true;
          },
          (err) => {
            console.log(err);
          }
        );
      }
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
