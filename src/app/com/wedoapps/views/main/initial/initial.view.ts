import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Component, OnInit, OnDestroy} from '@angular/core';
import {FiltersService, GoogleApiService, SubjectsInteractionsService, UtilitesService} from '../../../services';
import {ServerResponse, EventModel} from '../../../models/global.models';
import {GroupModel, EventsNearYou} from './initial.models';
import {AppService} from '../../../../../app.service';
import {InitialService} from './initial.service';
import {CookieService} from 'ngx-cookie';

@Component({
  selector: 'initial-view',
  templateUrl: 'initial.view.html',
  styleUrls: ['initial.view.scss']
})
export class InitialView implements OnInit, OnDestroy {
  public eventsNearYou: Array<EventsNearYou>;
  public groupId: string;
  public isAuthorized: boolean;
  public eventTitle: string;
  public loading: boolean = true;
  public userType: string;
  private _subscribeEventsNearYou: Subscription = new Subscription();
  public _lat: number;
  public _lon: number;
  public place: string = '';
  public isRegistrInfo: boolean = false;
  public defaultDates:any;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _initialService: InitialService,
    private _subjectsIteractionsService: SubjectsInteractionsService,
    private _appService: AppService,
    private _googleService: GoogleApiService,
    private _cookieService: CookieService,
    private _filtersService:FiltersService,
    private _utilities:UtilitesService
  ) {
    this.isAuthorized = this._appService.getIsAuthorized();
    this.getLocation();
    this.defaultDates = this._utilities.getDefaultDates();
  }

  ngOnInit() {
    this.isAuthorized ? this.eventTitle = 'events_around_you' : this.eventTitle = 'popular_events';
    this.userType = this._cookieService.get('user_type');
    this._subjectsIteractionsService.pageTags.next({title:'tags.home_title', desc:'tags.home_desc'});
    this._removeFiltersFromLocalStorage();
    this._subjectsIteractionsService.authorizationState.subscribe(async (data) => {
      this.isAuthorized = await data.isAuthorized;
      this._callSections(this.isAuthorized);
      this.isAuthorized ? this.eventTitle = 'events_around_you' : this.eventTitle = 'popular_events';
    });
  }

  private getLocation() {
    this._googleService.getUserLocation
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this._lat = value.lat;
          this._lon = value.lon;
          this.isRegistrInfo = value.registrInfo;
        }
        this._callSections(this.isAuthorized);
        if (!!value.place) {
          this.place = value.place;
          this._lat = value.lat;
          this._lon = value.lon
        } else {
          this.getPlace();
        }
      }, (error) => {
        console.log(error);
      });
  }

  private getPlace() {
    this._subjectsIteractionsService.$userPlace
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.place = value.place;
        }
      });
  }

  private _callSections(authorized: boolean): void {
    // if (!authorized && this.isRegistrInfo) {
    //   this._lon = null;
    //   this._lat = null;
    // }
    this._getEventsNearYou(this._lat, this._lon);
  }

  private _removeFiltersFromLocalStorage(): void {
    localStorage.removeItem('autocomplete');
    localStorage.removeItem('filters');
    localStorage.removeItem('calendar');
    localStorage.removeItem('distance');
    localStorage.removeItem('categories');
  }

  private _getEventsNearYou(lat: number = null, lon: number = null): void {
    this._subscribeEventsNearYou = this._initialService.getEventsNearYou(6, lat, lon, this.isAuthorized)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ServerResponse<Array<EventsNearYou>>) => {
        this.eventsNearYou = data.data;
        // console.log(data.info);
        // if (!data.info.near_you) {
        //   this.eventTitle = 'popular_events';
        // }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
