import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { CategoryModel, EventModel } from "../../../models/global.models";
import { EventDataModel } from "../../../views/main/initial/initial.models";
import { UtilitesService } from "../../../services/utilites.service";
import { SubjectsInteractionsService } from "../../../services";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../../../../../environments/environment";

@Component({
  selector: "app-event-row",
  templateUrl: "./event-row.component.html",
  styleUrls: ["./event-row.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class EventRowComponent implements OnInit, OnDestroy {
  public link: string;
  public isImageLoaded = true;
  private _eventItem: EventModel;
  public searchDate: any = { isMultiDate: false };
  @Output() public changeIncomingEvent = new EventEmitter<any>();
  @Output() public deleteEventEmitter = new EventEmitter<any>();

  @Input("incomingEvent")
  set incomingEvent($event) {
    this.isImageLoaded = true;
    this._eventItem = $event;
    this._setDataValues();
  }

  @Input("isSearchPage") public isSearchPage = false;
  @Input("rowSettings") public rowSettings: any = {
    showDescription: false,
    showUserIcons: false,
    showClose: false,
  };
  @Input("searchDate") set getSearchDates(dates) {
    this.searchDate = dates;
    const eventItemDates = this._utilitesService.checkDateTimeZone(
      this._eventItem.dates
    );
    this.setDates(eventItemDates);
  }
  @Input("filterType") public filterType: string;
  public img: string = "";
  public data: EventDataModel = new EventDataModel();
  public joinedUsers: Array<any>;
  public eventId: string;
  public categories: Array<CategoryModel>;
  public archive: boolean;
  public locale: string;
  private _eventNum = 0;
  private _subscription: Subscription;
  public hrefTarget: string = "_self";
  public showBtn: boolean = true;

  constructor(
    private _utilitesService: UtilitesService,
    private _router: Router,
    private _subjects: SubjectsInteractionsService
  ) {}

  ngOnInit() {
    this.setEventLink();
    this.checkLang();
    this.hrefTarget = this._router.url.includes("/search") ? "_blank" : "_self";
  }

  private setEventLink() {
    if (this.incomingEvent.view_type || this.incomingEvent.archive) {
      this.link = `/event/${this.incomingEvent._id}`;
    } else {
      this.link = `/basic/create-event/${this.incomingEvent._id}/preview`;
    }
    this.data.link = this.link;
  }

  public changeEvent(event): void {
    event.preventDefault();
    event.stopPropagation();
    this._eventNum++;
    this.changeIncomingEvent.emit({
      eventNum: this._eventNum,
      _id: this.eventId,
    });
  }

  public deleteCreatedEvent($event): void {
    console.log($event);
    this.deleteEventEmitter.emit({
      _id: this.eventId,
    });
  }

  private _setDataValues(): void {
    this.img = this._eventItem.poster.cropped.link;
    // this.img = this._eventItem.poster.min || this._eventItem.poster.cropped.link;
    const eventItemDates = this._utilitesService.checkDateTimeZone(
      this._eventItem.dates
    );
    this.setDates(eventItemDates);
    this.data.description = this._eventItem.description;
    this.data.location = this._eventItem.location;
    this.data.name = this._eventItem.name;
    this.joinedUsers = this._eventItem.joined_users;
    this.eventId = this._eventItem._id;
    this.data.id = this.eventId;
    this.data.endDateAndTimeHidden = this._eventItem.endDateAndTimeHidden;
    this.data.endTimeHidden = this._eventItem.endTimeHidden;
    this.data.startTimeHidden = this._eventItem.startTimeHidden;
    this.categories = this._eventItem.category;
    this.archive = this._eventItem.archive;
    this.showBtn = new Date(this.data.date.start) >= new Date();
    this.data.archive = this._eventItem.archive;
    this.setEventLink();
  }

  onImageLoaded() {
    this.isImageLoaded = false;
  }

  private setDates(eventItemDates) {
    if (!this.searchDate.isMultiDate) {
      const dates = this._utilitesService._sortDates(
        eventItemDates,
        new Date()
      );
      this.data.date.start = dates ? dates.start : eventItemDates[0].start;
    } else {
      const startDate = this.searchDate.start;
      const initialFilterDate = new Date(startDate).setHours(0, 0, 0, 0);
      const isSearchedToday =
        initialFilterDate == new Date().setHours(0, 0, 0, 0);
      const dateSearch = new Date(startDate).setTime(new Date().getTime());

      let filterDate = isSearchedToday ? dateSearch : initialFilterDate;
      const dates = this._utilitesService._sortDates(
        eventItemDates,
        filterDate
      );
      this.data.date.start = dates ? dates.start : eventItemDates[0].start;
    }
    this.data.date.end = eventItemDates.filter((date) => {
      return date.start == this.data.date.start;
    })[0].end;
  }

  public onImageError() {
    this.img = `${environment.BASE_URL}img/events/cropped/default.jpeg`;
  }

  private checkLang() {
    this._subscription = this._subjects.getCurrentLang().subscribe((lang) => {
      this.locale = lang;
    });
  }

  get incomingEvent(): EventModel {
    return this._eventItem;
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
