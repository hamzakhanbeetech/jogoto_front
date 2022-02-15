import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {EventsNearYou, EventDataModel} from '../../../views/main/initial/initial.models';
import {UtilitesService} from '../../../services/utilites.service';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {SubjectsInteractionsService} from '../../../services';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {environment} from "../../../../../../environments/environment";
import * as moment from 'moment';


@Component({
  selector: 'app-event-column',
  templateUrl: './event-column.component.html',
  styleUrls: ['./event-column.component.scss']
})
export class EventColumnComponent implements OnInit, OnDestroy {
  public data: EventDataModel = new EventDataModel();
  public _eventItem: EventsNearYou;
  public img: string = '';
  public otherDate = {date: ''};
  public locale: string;
  public hrefTarget: string = '_self';
  public subscription: Subscription;
  public BASE_IMG:string = `${environment.BASE_URL}img/events/cropped/default.jpeg`;
  public searchDate:any = {isMultiDate: false};
  @Input('isShowDescription') public isShowDescription: boolean = true;
  @Input('isShowUserIcons') public isShowUserIcons: boolean = true;
  @Input('userIsLoggedIn') public userIsLoggedIn: boolean = true;
  @Input('isSettingsPage') public isSettingsPage: boolean = false;
  @Input('searchDate')set getSearchDates(dates){
    this.searchDate = dates;
  }
  @Input('eventItem')
  set eventItem($event) {
    this._eventItem = $event;
    if($event.dates.length){
      this._setDataValues();
    }
  }


  constructor(private _utilitesService: UtilitesService,
              private _subjects: SubjectsInteractionsService,
              private _router:Router) {
  }

  ngOnInit() {
    this.checkLang();
    this.hrefTarget = this._router.url.includes('/search') ? '_blank' : '_self';
  }

  private _setDataValues(): void {
    const eventItemDates = this._utilitesService.checkDateTimeZone(this._eventItem.dates);
    if(this._eventItem.dates.length < 2){
      const dates = this._utilitesService._sortDates(eventItemDates, new Date());
      this.data.date.start = dates ? dates.start: eventItemDates[0].start ;
      this.data.date.end = dates ? dates.end: eventItemDates[0].end;
    }else {
      const startDate = this.searchDate.start;
      const initialFilterDate = new Date(startDate).setHours(0,0,0,0);
      const isSearchedToday =  initialFilterDate == new Date().setHours(0,0,0,0);
      const dateSearch = new Date(startDate).setTime(new Date().getTime());
      let filterDate = isSearchedToday? dateSearch : initialFilterDate;
      const dates = this._utilitesService._sortDates(eventItemDates, filterDate);
      this.data.date.start = dates ? dates.start: eventItemDates[0].start;
      this.data.date.end = dates ? dates.end: eventItemDates[0].end;
    }
    this._checkDate(this.data.date.start);
    this.data.description = this._eventItem.description;
    this.data.location = this._eventItem.location;
    this.data.name = this._eventItem.name;
    this.data.id = this._eventItem._id;
    this.data.link = `/event/${this._eventItem._id}`;
    this.data.endDateAndTimeHidden = this._eventItem.endDateAndTimeHidden;
    this.data.endTimeHidden = this._eventItem.endTimeHidden;
    this.data.startTimeHidden = this._eventItem.startTimeHidden;
    // this.img = this._eventItem.poster.min || this._eventItem.poster.cropped.link;
    this.img = this._eventItem.poster.cropped.link;


  }

  private _checkDate(date) {
    const today = new Date();
    if (today >= new Date(date)) {
      this.otherDate.date = today.toString();
    } else {
      this.otherDate.date = date;
    }
  }

  private checkLang() {
    this.subscription = this._subjects.getCurrentLang()
      .subscribe(lang => {
        this.locale = lang;
      });
  }

  get eventItem(): EventsNearYou {
    return this._eventItem;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
