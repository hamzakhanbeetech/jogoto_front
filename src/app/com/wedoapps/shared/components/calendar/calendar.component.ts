import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

import {NgbCalendar, NgbDatepickerI18n, NgbDate, NgbDatepicker} from '@ng-bootstrap/ng-bootstrap';
import {FiltersService, SubjectsInteractionsService, UtilitesService} from '../../../services';
import {FieldsOfSearching} from '../../../views/main/search/search.models';
import {DatePipe} from '@angular/common';
import * as moment from 'moment';
import {DatepickerTranslateService} from '../../../services/datepicker-translate.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{provide: NgbDatepickerI18n, useClass: DatepickerTranslateService}]
})
export class CalendarComponent implements OnInit, OnDestroy {
  @Input('isDynamicSearch') private _isDynamicSearch: boolean = false;
  @Input('isClosed') private set
  sendData(value){
      if(value && !value.isClosed){
          if(this._isDynamicSearch){
              this._navToSearch();
          }else if(value.isOk && !this._windowWidth){
            this._subjectInteractionService.searchFromFilter.next(true);
          }else{
            this._filtersService.setCalendar({fromDate: this.fromDate, toDate: this.toDate});
            if(value.isOk){
              this._subjectInteractionService.searchFromFilter.next(true);
            }
          }
      }
  }
  @ViewChild('dp', { static: true }) db: NgbDatepicker;
  public hoveredDate: NgbDate;
  public fromDate: NgbDate;
  public toDate: NgbDate;
  public selectedFromDate: string;
  public selectedToDate: string;
  public weekDays: number;
  public type: string = 'week';
  public minDate: object;
  public startDay: NgbDate;
  public today: NgbDate;
  public clearCalendar: boolean = false;
  private _searchingData: FieldsOfSearching = {} as FieldsOfSearching;
  private _windowWidth: boolean = window.innerWidth < 568;
  private _subscription: Subscription = new Subscription();
  private _dynamicSearchSubscription: Subscription = new Subscription();
  private _activatedRouteSubscription: Subscription;

  constructor(
    private calendar: NgbCalendar,
    private _subjectInteractionService: SubjectsInteractionsService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _datePipe: DatePipe,
    private _filtersService: FiltersService,
    private utilitesService: UtilitesService
  ) {
    this._setCalendarDefaultValue();
    this._disablePastDays();
  }

  ngOnInit() {
    this._checkQueryParams();
    this._handleOnSearchEvent();
    this._handleDynamicSearchEvent();
    if (this.db) {
      this.db.navigateTo(this.fromDate);
    }
    if (this.clearCalendar) {
      this._setCalendarDefaultValue();
      // this.fromDate = this.calendar.getToday();
      // this.startDay = this.fromDate;
      // this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 10);
    }
    this.checkDateButton(this.fromDate, this.toDate);
 }

  private _checkQueryParams() {
    this._activatedRouteSubscription = this._activatedRoute.queryParams.subscribe((params) => {
      this._searchingData = params as FieldsOfSearching;

      if (params.start_date && params.end_date) {
          this.clearCalendar = false;
        let fromDate = NgbDate.from({
          year: +this._datePipe.transform(params.start_date, 'yyyy'),
          month: +this._datePipe.transform(params.start_date, 'MM'),
          day: +this._datePipe.transform(params.start_date, 'dd')
        });
        let toDate = NgbDate.from({
          year: +this._datePipe.transform(params.end_date, 'yyyy'),
          month: +this._datePipe.transform(params.end_date, 'MM'),
          day: +this._datePipe.transform(params.end_date, 'dd')
        });
        console.log(fromDate, toDate)
        this.checkDateButton(fromDate, toDate);
        if (fromDate && toDate && !toDate.after(fromDate)) {
            this.fromDate = fromDate;
            this.startDay = this.fromDate;
            this.toDate = null;
            return;
        }
          this.fromDate = fromDate;
        this.toDate = toDate;
      } else if (this._windowWidth && !this._isDynamicSearch) {
        this.clearCalendar = false;
        if (this._filtersService.getSelectedFilters().calendar.fromDate) {
          this.fromDate = this._filtersService.getSelectedFilters().calendar.fromDate;
        } else {
          this.fromDate = this.calendar.getToday();
        }
        if (this._filtersService.getSelectedFilters().calendar.toDate) {
          this.toDate = this._filtersService.getSelectedFilters().calendar.toDate;
        } else {
          this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 10);
        }
            this.checkDateButton(this.fromDate, this.toDate);
      } else {
        this.clearCalendar = true;
        // this.fromDate = this.calendar.getToday();
        // this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 10);
        // this.checkDateButton(this.fromDate,   this.toDate);
      }
      this._setDateFormat();
      if(this.db){
        this.db.navigateTo(this.fromDate)
      }
      this.startDay = this.fromDate;
    });
  }

  private _disablePastDays() {
    const current = new Date();
    this.minDate = NgbDate.from({
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    });
    this.today = this.calendar.getToday();
  }

  private _navToSearch(): void {
    if (this._isDynamicSearch && this.selectedFromDate) {
      const type = this._searchingData.type || 'event';

      if (!this.selectedToDate)
        this.selectedToDate = this.selectedFromDate

      if (type === 'event') {
        const searchInputValue:string = this._subjectInteractionService.searchInputValue.getValue();
        const localisedUrl = this.utilitesService.localizeRouter('/search');
        this._router.navigate([localisedUrl], {
          relativeTo: this._activatedRoute, queryParams: {
            type: 'event',
            distance: this._searchingData.distance || null,
            categories: this._searchingData.categories || null,
            start_date: this.selectedFromDate || null,
            end_date: this.selectedToDate || null,
            query: searchInputValue || null,
            autocomplete: this._searchingData.autocomplete || null,
            filter: this._searchingData.filter || null,
            lat: this._searchingData.lat || null,
            lon: this._searchingData.lon || null,
                southWestLat: this._searchingData.southWestLat || null,
                southWestLng: this._searchingData.southWestLng || null,
                northEastLat: this._searchingData.northEastLat || null,
                northEastLng: this._searchingData.northEastLng || null,
                northWestLat: this._searchingData.northWestLat || null,
                northWestLng: this._searchingData.northWestLng || null,
                southEastLat: this._searchingData.southEastLat || null,
                southEastLng: this._searchingData.southEastLng || null,
                searchedText: this._searchingData.searchedText || null
          }
        });
      }
    }
  }

  private _setDateFormat(): void {
    // if (this.fromDate && this.toDate) {
    if (this.fromDate)
      this.selectedFromDate = moment(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day)).format('YYYY-MM-DD');
    if (this.toDate)
      this.selectedToDate = moment(new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day)).format('YYYY-MM-DD');

    this._filtersService.setCalendar({fromDate: this.fromDate, toDate: this.toDate || this.fromDate});
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (((this.fromDate && !this.toDate) || this.fromDate === this.toDate) && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = date;
      this.fromDate = date;
    }
      this._setDateFormat();

    if (this.fromDate && this.toDate) {
      // this._navToSearch();
    }

    console.log(this)
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  public isDisabled(date): boolean {
    return date.after(this.today) || date.equals(this.today);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }

  setToday() {
    this.type = 'today';
    this.fromDate = this.calendar.getToday();
    this.startDay = this.fromDate;
    this.toDate = this.calendar.getToday();
    this._setDateFormat();
  }

  setThisWeek() {
    this.type = 'week';
    this.fromDate = this.calendar.getToday();
    this.startDay = this.fromDate;
    this.weekDays = 7 - this.calendar.getWeekday(this.fromDate);
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', this.weekDays);
    this._setDateFormat();
  }

  setWeekend() {
    this.type = 'weekend';
    this.fromDate = this.calendar.getToday();
    this.weekDays = 7 - this.calendar.getWeekday(this.fromDate);
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', this.weekDays);
    this.fromDate = this.calendar.getNext(this.toDate, 'd', -1);
    this.startDay = this.fromDate;
    this._setDateFormat();
  }

  private _handleOnSearchEvent(): void {
    this._subscription = this._subjectInteractionService.onSearchState.subscribe(async (data: boolean) => {
      let isSearch: boolean = await data;
      this._setDateFormat();
      this._onSearch();
    });
  }

  private checkDateButton(start, end){
    if (!start || !end)
      return
    const today  = this.calendar.getToday();
    const weekDay  = 7 - this.calendar.getWeekday(today);
    const thisWeek  = this.calendar.getNext(today, 'd', weekDay);
    const weekend  = this.calendar.getNext(thisWeek, 'd', -1);
    //console.log(this.calendar);
    if(start.equals(today) && end.equals(today)){
        this.type = 'today'
      }else if(start.equals(today) && end.equals(thisWeek)){
        this.type = 'week'
      }else if(start.equals(weekend) && end.equals(thisWeek)){
        this.type = 'weekend'
      }else{
          this.type = null
      }
  }

  private _onSearch(): void {
    if (!this.fromDate || !this.toDate) {
      return;
    }
    let from = moment(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day)).format('YYYY-MM-DD');

    let to = moment(new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day)).format('YYYY-MM-DD');
    this._subjectInteractionService.filterWhen.next({fromDate: from || '', toDate: to || ''});
  }

  private _setCalendarDefaultValue(): void {
    if (!this.fromDate || !this.toDate) {
      return;
    }
    this.weekDays = 7 - this.calendar.getWeekday(this.fromDate);
    this.selectedFromDate = moment(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day)).format('YYYY-MM-DD');
    this.selectedToDate = moment(new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day)).format('YYYY-MM-DD');
  }

  private _handleDynamicSearchEvent(): void {
    this._dynamicSearchSubscription = this._subjectInteractionService.dynamicSearchState.subscribe(async (dynamicSearch: boolean) => {
      this._isDynamicSearch = await dynamicSearch;
    });
  }

  ngOnDestroy() {
    if (this._windowWidth) {
      this._filtersService.setCalendar({fromDate: this.fromDate, toDate: this.toDate});
      this._navToSearch();
    }
    if (this._activatedRouteSubscription) {
      this._activatedRouteSubscription.unsubscribe();
    }
    this._subscription.unsubscribe();
    this._dynamicSearchSubscription.unsubscribe();
  }
}
