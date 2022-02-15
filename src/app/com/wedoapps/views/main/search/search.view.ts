import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterContentInit,
  HostListener,
  NgZone,
  ElementRef
} from '@angular/core';
import {SearchService} from './search.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CookieService} from 'ngx-cookie';
import {FieldsOfSearching} from './search.models';
import {Subject, Subscription} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {AppService} from '../../../../../app.service';
import {GoogleApiService, SubjectsInteractionsService, UtilitesService, FiltersService} from '../../../services';
import {EventModel, ServerResponse, UserModel} from '../../../models/global.models';
import {GroupModel} from '../initial/initial.models';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {MatModalComponent} from '../../../shared/components/mat-modal/mat-modal.component';
import {TranslateService} from '@ngx-translate/core';
import {debounceTime, takeUntil} from 'rxjs/operators';
import * as moment from 'moment-timezone';

// declare const gtag;

@Component({
  selector: 'search-view',
  templateUrl: 'search.view.html',
  styleUrls: ['search.view.scss'],
})
export class SearchView implements OnInit, OnDestroy, AfterViewInit {
  public eventSearchingData: FieldsOfSearching = {} as FieldsOfSearching;
  public autocomplete: string;
  public textOfSearchInput: string;
  public eventlimit: number = 15;
  public eventskip: number = 0;
  public suggestedEventLimit: number = 6;
  public suggestedEvenSkip: number = 0;
  public suggestSkipCheck: boolean = true;
  public suggestedEventLoading: boolean = false;
  public suggestedEventsblock: boolean = false;
  public suggestedEventsCount: number;
  public suggestedEvents: Array<EventModel> = [];
  public userlimit: number = 6;
  public userskip: number = 0;
  public grouplimit: number = 6;
  public groupskip: number = 0;
  public groups: GroupModel[] = [];
  public isAuthorized: boolean;
  public loadMore: boolean = false;
  public events: EventModel[] = [];
  public loading: boolean = false;
  public isShowFilters: boolean = false;
  public users: UserModel[] = [];
  public emptyResult: boolean = false;
  public smallDisplay: boolean = window.innerWidth < 568;
  public userSearchingData: any;
  public groupSearchingData: any;
  public title = {
    'dropdownFilter': this.translate.instant('filter.event_filters'),
    'dropdownWhere': this.translate.instant('filter.choose_location'),
    'dropdownWhen': this.translate.instant('filter.date_filters'),
    'dropdownCats': this.translate.instant('filter.categories'),
  };

  public noSearchResult: any;
  public resetButton: boolean = false;
  public popularity: boolean = false;
  public isShowMap: boolean;
  public isScroll:boolean = false;

  private _searchForm: FormGroup;
  private _subscription: Subscription = new Subscription();
  private _queryParamsSubscription = new Subscription();
  private _searchSubscription: Subscription = new Subscription();
  private mapSubsccription: Subscription;
  private paramsChanged: boolean = true;
  private fullMapEvents: EventModel[] = [];
  public isFullMap:boolean = false;
  requestTimer = null;
  private autocompleteChecked:boolean = false;
  private subscription$: Subject<void> = new Subject<void>();
  public inputFocused:boolean = true;
  public checkScroll: boolean = true;
  public isOnline = false

  @ViewChild('searchInputText', { static: true }) public searchInputText: any;
  @ViewChild('searchTabs', { static: true }) searchTabs: any;
  @ViewChild('searchUsers', { static: true }) searchUsers: any;
  @ViewChild('searchGroupsTab', { static: true }) searchGroups: any;

  @ViewChild('filterWhere', { static: false }) filterWhere: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth > 575) {
      this._dialog.closeAll();
      this.smallDisplay = false;
    } else {
      this.smallDisplay = true;
    }
  }

  constructor(private _searchService: SearchService,
              private _activatedRoute: ActivatedRoute,
              private _cookieService: CookieService,
              private _router: Router,
              private _appService: AppService,
              private _subjectsIteractionsService: SubjectsInteractionsService,
              private _dialog: MatDialog,
              private translate: TranslateService,
              private _ngZone:NgZone,
              private googleApi:GoogleApiService,
              private _utilitiesService: UtilitesService,
                  private _filtersService: FiltersService
  ) {
    this.isAuthorized = this._appService.getIsAuthorized();
    this._activatedRoute.queryParams.subscribe(params => {
      let date = params['query'];
      if (date) {
        this.resetButton = true;
      } else {
        this.resetButton = false;
      }
    });
  }

  ngOnInit() {
    this._formBuilder();
    this._getQueryParams();
    this._checkUserState();
    this.getEventsFromMap();
    this._subjectsIteractionsService.pageTags.next({title:'tags.search_event_title', desc:'tags.search_event_desc'});
    this.translate.get('no-result.no_followers_show').subscribe((translated: string) => {
      this.noSearchResult = {
        group: {
          icon: 'icon-group',
        },
        user: {
          icon: 'icon-search-user',
        },
        event: {
          icon: 'icon-search-calendar',
        }
      };
    });


    this.mapSubsccription = this._subjectsIteractionsService.getMapAsObservable()
      .subscribe(res => {
        this.isShowMap = res;
        console.log('isShowMap', this.isShowMap)
      });
    this.isAutocompleteChecked();
  }

  ngAfterViewInit() {
    this._setDynamicSearch();
  }

  public searchText(e) {
    if (e.target.value) {
      this.resetButton = true;
    } else {
      this.resetButton = false;
    }
  }

  private _resetProperties(): void {
    this.emptyResult = false;
  }

  public resetSearchText(): void {
    this.searchInputText.nativeElement.value = '';
    if(this.inputFocused){
        this.searchInputText.nativeElement.focus();
    }
    this._searchForm.get('search').patchValue('');
    this.resetButton = false;
    this._navToSearchInSelectedValues();
  }

  public inputBlur(event){
      const elementId = event.target.id;
      this.inputFocused = elementId == 'close' || elementId == 'reset';
  }

  public openFilter(data){
    if(this.smallDisplay){
      this.openDialog(data,this.title[data])
    }else{
      const doc  = <HTMLElement>document.querySelector(`#${data}`);
      doc.click();
    }
  }

  // get min-heigh of search container
  public _getSectionsHeight(nativeElement, type: string) {
    const containerHeight = window.innerHeight - 210;

    if (window.innerWidth >= 1200) {
      switch (type) {
        case 'event': {
          return this._getColumsCount(containerHeight, 420, 3, 6);
        }
        case 'group': {
          return this._getColumsCount(containerHeight, 370, 4, 8);
        }
        case 'user': {
          return this._getColumsCount(containerHeight, 240, 3, 6);
        }
      }
    }
    if (window.innerWidth >= 768 && window.innerWidth <= 1200) {
      switch (type) {
        case 'event': {
          return this._getColumsCount(containerHeight, 420, 2, 4);
        }
        case 'group': {
          return this._getColumsCount(containerHeight, 370, 2, 4);
        }
        case 'user': {
          return this._getColumsCount(containerHeight, 205, 2, 4);
        }
      }
    }
    if (window.innerWidth < 768) {
      switch (type) {
        case 'event': {
          return this._getColumsCount(containerHeight, 420, 1, 1);
        }
        case 'group': {
          return this._getColumsCount(containerHeight, 350, 1, 1);
        }
        case 'user': {
          return this._getColumsCount(containerHeight, 170, 2, 4);
        }
      }
    }
  }

  private _getColumsCount(containerHeight: number, height: number = 420, horizontalCount: number = 3, verticalCount: number = 6): number {
    const count: number = containerHeight / height;
    let limit = Math.ceil((count * horizontalCount));
    if (limit < 6) {
      limit = 6;
    }
    return limit;
  }

  private _formBuilder(): void {
    this._searchForm = new FormGroup({
      search: new FormControl(null),
      searchBy: new FormControl(null)
    });
    setTimeout(() => {
      this._searchForm.get('searchBy').setValue('event', {emitEvent: false});
    }, 0);
    this._searchForm.get('searchBy').valueChanges.subscribe((value) => {
      const localisedUrl = this._utilitiesService.localizeRouter(`/search`);
      this._subjectsIteractionsService.pageTags.next({title:`tags.search_${value}_title`, desc:`tags.search_${value}_desc`});
      this._checkEmptyResult();
      if (value === 'event') {
        this._router.navigate([localisedUrl], {
          relativeTo: this._activatedRoute, queryParams: {
            type: 'event',
            distance: this.eventSearchingData.distance || null,
            categories: this.eventSearchingData.categories || null,
            start_date: this.eventSearchingData.start_date,
            end_date: this.eventSearchingData.end_date,
            query: this._searchForm.value.search,
            autocomplete: this.eventSearchingData.autocomplete,
            filter: this.eventSearchingData.filter || null,
            lat: this.eventSearchingData.lat || null,
            lon: this.eventSearchingData.lon || null,
                southWestLat:this.eventSearchingData.southWestLat|| null,
                southWestLng:this.eventSearchingData.southWestLng|| null,
                northEastLat:this.eventSearchingData.northEastLat|| null,
                northEastLng:this.eventSearchingData.northEastLng|| null,
                northWestLat:this.eventSearchingData.northWestLat|| null,
                northWestLng:this.eventSearchingData.northWestLng|| null,
                southEastLat:this.eventSearchingData.southEastLat|| null,
                southEastLng:this.eventSearchingData.southEastLng|| null,
                searchedText:this._searchForm.value.search || null
          }
        });
      }
      if (value === 'group') {
        this._router.navigate([localisedUrl], {
          relativeTo: this._activatedRoute,
          queryParams: {type: 'group', query: this.searchForm.get('search').value}
        });
      }
      if (value === 'user') {
        this._router.navigate([localisedUrl], {
          relativeTo: this._activatedRoute,
          queryParams: {type: 'user', query: this.searchForm.get('search').value, userType: 'all'}
        });
      }

    });
      this._searchForm.get('search')
          .valueChanges
          .pipe(debounceTime(300), takeUntil(this.subscription$))
          .subscribe((value)=>{
          this._subjectsIteractionsService.searchInputValue.next(value)
      })
  }

  private _getQueryParams(): void {
    this._queryParamsSubscription = this._activatedRoute.queryParams
      .subscribe((params: FieldsOfSearching) => {
        if (params && Object.keys(params).length > 0) {
          this._searchForm.get('search').patchValue(params.query);
          this.autocomplete = params.autocomplete;
          this.isOnline = params.isOnline

          console.log('_getQueryParams', params)
          this.textOfSearchInput = params.query;
          this._resetProperties();
          //setTimeout is used for not causing ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this._searchForm.get('searchBy').setValue((
              params.type === 'group' ||
              params.type === 'user' ||
              params.type === 'event')
              ? params.type
              : 'event', {emitEvent: false});
          }, 0);
          switch (params.type) {
            case 'event': {
              if (this.requestTimer !== null) {
                clearTimeout(this.requestTimer);
              }
              this.requestTimer = setTimeout(() => {
                this.onParamsChange(params);
              }, 500);
              break;
            }
            case 'group': {
              this.isShowFilters = false;
              if (JSON.stringify(this.groupSearchingData) !== JSON.stringify(params)) {
                this._searchGroups(this.textOfSearchInput || '');
              }
              this.groupSearchingData = params;
              break;
            }
            case 'user': {
              this.isShowFilters = false;
              if (JSON.stringify(this.userSearchingData) !== JSON.stringify(params)) {
                this._searchUsers(this.textOfSearchInput || '', params.userType || 'all');
              }
              this.userSearchingData = params;
              break;
            }
            default: {
              this._getDataOfSearchingEvents();
            }
          }
        } else {
          this._searchForm.get('search').patchValue('');
          this.eventSearchingData = {} as FieldsOfSearching;
          this.userSearchingData = {} as FieldsOfSearching;
          this._getDataOfSearchingEvents();
        }
      });
  }

  private onParamsChange(params) {
    this.isShowFilters = true;
    if (JSON.stringify(this.eventSearchingData) === JSON.stringify(params)) {
      this._subjectsIteractionsService.searchedEvents.next(this.events);
    } else {
      this.eventSearchingData = params;
      this._getDataOfSearchingEvents();
    }
  }

  private getEventIds(){
      const ids  = this.events.map((event)=>event._id);
      return {ids}
  }

  private _checkUserState(): void {
    this._subjectsIteractionsService.authorizationState.subscribe(async (data) => {
      this.isAuthorized = await data.isAuthorized;
      this._getDataOfSearchingEvents();
    });
  }

  private _handleSearchFilters(): void {
    this._navToSearchInSelectedValues();
  }

    private isAutocompleteChecked(){
        this._subjectsIteractionsService.autocompleteCheckedState
            .pipe(takeUntil(this.subscription$))
            .subscribe((value)=>{
            this.autocompleteChecked = value;
        })
    }

  private _navToSearchInSelectedValues(): void {
    const type: string = this._searchForm.get('searchBy').value;
    const localisedUrl = this._utilitiesService.localizeRouter(`/search`);

    if (!this.smallDisplay && this.filterWhere.buttonClick)
      this.filterWhere.button.nativeElement.click()

      let parsedObjectOnline = this._filtersService.getSelectedFilters().isOnline;

    if (this._filtersService.getSelectedFilters().autocomplete && this.autocompleteChecked && !parsedObjectOnline) {
      console.log(this.eventSearchingData, this._filtersService.getSelectedFilters())

      this.eventSearchingData = {
        ...this.eventSearchingData,
        autocomplete: this._filtersService.getSelectedFilters().autocomplete.autocomplete,
        lat: this._filtersService.getSelectedFilters().autocomplete.latLng.lat.toString(),
        lon: this._filtersService.getSelectedFilters().autocomplete.latLng.lng.toString()
      } as FieldsOfSearching

      // this.eventSearchingData.autocomplete = this._filtersService.getSelectedFilters().autocomplete.autocomplete



      // Object.assign(this.eventSearchingData, {
      //   autocomplete: this._filtersService.getSelectedFilters().autocomplete.autocomplete,
      //   lat: this._filtersService.getSelectedFilters().autocomplete.latLng.lat.toString(),
      //   lon: this._filtersService.getSelectedFilters().autocomplete.latLng.lng.toString()
      // })
    }

    if (type === 'event') {
        const searchValue = this._searchForm.value.search;
        // !(this.eventSearchingData.autocomplete) ? this.eventSearchingData.distance = null : null;
      //   if(!this.autocompleteChecked && searchValue && searchValue.trim().length > 1 ){
      //       const trimedValue = searchValue.trim();
      //     this.googleApi.findPlaceByCoordinates(null,null, trimedValue)
      //         .subscribe(({value, latLng, address}) =>{
      //         if(value && value.trim().toLowerCase().includes(trimedValue.toLowerCase()) && !address){
      //             this._router.navigate([localisedUrl], {
      //                 relativeTo: this._activatedRoute, queryParams: {
      //                     type: 'event',
      //                     categories: this.eventSearchingData.categories || null,
      //                     start_date: this.eventSearchingData.start_date,
      //                     end_date: this.eventSearchingData.end_date,
      //                     query: trimedValue || null,
      //                     autocomplete: value,
      //                     filter: this.eventSearchingData.filter || null,
      //                     lat: latLng.lat || null,
      //                     lon: latLng.lng || null,
      //                     southWestLat:this.eventSearchingData.southWestLat|| null,
      //                     southWestLng:this.eventSearchingData.southWestLng|| null,
      //                     northEastLat:this.eventSearchingData.northEastLat|| null,
      //                     northEastLng:this.eventSearchingData.northEastLng|| null,
      //                     northWestLat:this.eventSearchingData.northWestLat|| null,
      //                     northWestLng:this.eventSearchingData.northWestLng|| null,
      //                     southEastLat:this.eventSearchingData.southEastLat|| null,
      //                     southEastLng:this.eventSearchingData.southEastLng|| null,
      //                     isSearched:true
      //                 }
      //             });
      //         }else{
      //             this._router.navigate([localisedUrl], {
      //                 relativeTo: this._activatedRoute, queryParams: {
      //                     type: 'event',
      //                     distance: this.eventSearchingData.distance || null,
      //                     categories: this.eventSearchingData.categories || null,
      //                     start_date: this.eventSearchingData.start_date,
      //                     end_date: this.eventSearchingData.end_date,
      //                     query: trimedValue || null,
      //                     autocomplete:  this.eventSearchingData.autocomplete,
      //                     filter: this.eventSearchingData.filter || null,
      //                     lat: this.eventSearchingData.lat || null,
      //                     lon: this.eventSearchingData.lon || null,
      //                     southWestLat:this.eventSearchingData.southWestLat|| null,
      //                     southWestLng:this.eventSearchingData.southWestLng|| null,
      //                     northEastLat:this.eventSearchingData.northEastLat|| null,
      //                     northEastLng:this.eventSearchingData.northEastLng|| null,
      //                     northWestLat:this.eventSearchingData.northWestLat|| null,
      //                     northWestLng:this.eventSearchingData.northWestLng|| null,
      //                     southEastLat:this.eventSearchingData.southEastLat|| null,
      //                     southEastLng:this.eventSearchingData.southEastLng|| null,
      //                     isSearched:true,
      //                     searchedText: trimedValue || null
      //                 }
      //             });
      //         }
      //     })
      // }else{
          this._router.navigate([localisedUrl], {
              relativeTo: this._activatedRoute, queryParams: {
                  type: 'event',
                  distance: this.eventSearchingData.distance || null,
                  categories: this.eventSearchingData.categories || null,
                  start_date: this.eventSearchingData.start_date,
                  end_date: this.eventSearchingData.end_date,
                  query: (this._searchForm.value.search) ? this._searchForm.value.search.trim() : null,
                  autocomplete:  this.eventSearchingData.autocomplete,
                  isOnline: parsedObjectOnline,
                  filter: this.eventSearchingData.filter || null,
                  lat: this.eventSearchingData.lat || null,
                  lon: this.eventSearchingData.lon || null,
                  southWestLat:this.eventSearchingData.southWestLat|| null,
                  southWestLng:this.eventSearchingData.southWestLng|| null,
                  northEastLat:this.eventSearchingData.northEastLat|| null,
                  northEastLng:this.eventSearchingData.northEastLng|| null,
                  northWestLat:this.eventSearchingData.northWestLat|| null,
                  northWestLng:this.eventSearchingData.northWestLng|| null,
                  southEastLat:this.eventSearchingData.southEastLat|| null,
                  southEastLng:this.eventSearchingData.southEastLng|| null,
                  isSearched:true,
                  searchedText: (this._searchForm.value.search) ? this._searchForm.value.search.trim() : null
              }
          });
      // }
    }
    if (type === 'group') {
      this._router.navigate([localisedUrl], {
        relativeTo: this._activatedRoute,
        queryParams: {type: 'group', query: this.searchForm.get('search').value}
      });
    }
    if (type === 'user') {
      this._router.navigate([localisedUrl], {
        relativeTo: this._activatedRoute,
        queryParams: {
          type: 'user',
          query: this.searchForm.get('search').value,
          user: this.userSearchingData.userType || 'all'
        }
      });
    }
  }

  public closeKeyBoard(e) {
    if (e.code === 'Enter') {
      this.searchInputText.nativeElement.blur();
    }
  }

  private _searchUsers(username: string, userType: string, scrollEvent?: boolean): void {
    this.isShowFilters = false;
    this.loading = true;
    this.emptyResult = false;
    if (!scrollEvent) {
      this.userlimit = this._getSectionsHeight(this.searchUsers.nativeElement, 'user');
      this.userskip = 0;
    } else {
      this.userlimit = 6;
    }
    this._searchService.searchUsers(username, userType, this.userskip, this.userlimit).subscribe((data: ServerResponse<UserModel[]>) => {
      this.loading = false;
      if (scrollEvent) {
        this.users.push(...data.data);
      } else {
        this.users = data.data;
      }
      this._checkEmptyResult();
      this.loadMore = false;
      this.loadMore = data.data.length > 0;
    });
  }


  private _searchGroups(groupname: string, scrollEvent?: boolean): void {
    this.isShowFilters = false;
    this.loading = true;
    this.emptyResult = false;
    if (!scrollEvent) {
      this.grouplimit = this._getSectionsHeight(this.searchGroups.nativeElement, 'group');
      this.groupskip = 0;
    } else {
      this.grouplimit = 6;
    }
    this._searchService.searchGroups(groupname, this.groupskip, this.grouplimit).subscribe((data) => {
      this.loading = false;
      if (scrollEvent) {
        this.groups.push(...data.data);
      } else {
        this.groups = data.data;
      }
      this.loading = false;
      this.loadMore = data.data.length > 0;
      this._checkEmptyResult();
    });
  }

  private _setDynamicSearch(): void {
    this._subjectsIteractionsService.dynamicSearch.next(true);
  }

  public _getDataOfSearchingEvents(scrollEvent?: boolean): void {
    this.isShowFilters = true;
    this.emptyResult = false;
    this.loading = true;
    this.suggestedEvenSkip = 0;
    this.suggestedEvents = [];

    if (this.isFullMap) {
      this.eventlimit = 200;
    } else if (!scrollEvent) {
      this.eventlimit = 15;
      this.eventskip = 0;
    } else {
        this.eventlimit = 15;
        this.eventskip += this.eventlimit + 1;
    }
    const {...data} = this.eventSearchingData;
    const isSearchedToday =  new Date(data.start_date).setHours(0,0,0,0) == new Date().setHours(0,0,0,0);
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const date = (new Date(Date.now() - tzoffset)).toISOString();

    console.log({data, date, isSearchedToday})

    if (data && (!data.lat || !data.lon) && data.distance) {
      delete data.distance;
    }
      data.query = this.textOfSearchInput;
      data.zone = moment.tz.guess();
      // this.eventskip > 15 ? this.eventskip +=1 : 0;
      let skip  = (this.isFullMap) ? 0:this.eventskip ;

      this._subscription = this._searchService.getEventSearchingDatas(
      this.isAuthorized,
          skip,
      this.eventlimit,
      this.popularity,
      this._cookieService.get('user_id') || '',
      data,
      isSearchedToday ? date : data.start_date
    ).subscribe((data: ServerResponse<EventModel[]>) => {
      if (scrollEvent) {
        this.checkScroll = true;
        data.data.map(event => {
          this.events.push(event);
        });
      } else if (this.isFullMap) {
        this.fullMapEvents = data.data;
        this._subjectsIteractionsService.searchedEvents.next(this.fullMapEvents);
      } else {
        this.events = data.data;
        this.suggestedEventsblock = false;
      }
        this._checkEmptyResult();
      if (!this.isFullMap) {
        this._subjectsIteractionsService.searchedEvents.next(this.events);
      }
      this.loading = false;
      this.isScroll = false;
      this.loadMore = data.data.length > 0;
      this.paramsChanged = true;

      if (!this.loadMore && !this.emptyResult) {
        this.suggestedEventsblock = true;
          this.getSuggestedEventsSearching();
      }
      this._ngZone.run(()=>{
          return this.events
      })
    }, error1 => {
      this.loading = false;
    });
    this._subjectsIteractionsService.dynamicSearch.next(true);
  }

  public getSuggestedEventsSearching(): void {
    const {autocomplete, ...data} = this.eventSearchingData;
      if (data && (!data.lat || !data.lon) && data.distance) {
      delete data.distance;
    }
    const ids = this.getEventIds();
      data.query = this.textOfSearchInput;
    this.suggestedEvenSkip += 6;
    this._searchService.getSuggestedEventsSearching(this.isAuthorized,
      this.suggestedEvenSkip,
      this.suggestedEventLimit,
      this._cookieService.get('user_id') || '',
      data, ids).subscribe(events => {
        if(this.isOnline){
          events.data.map(event => {
            if(event.event_create_type.event_link){
              this.suggestedEvents.push(event);

            }
          });

        }else{
          events.data.map(event => {
            this.suggestedEvents.push(event);
          });

        }
      this.suggestSkipCheck = true;
      this.suggestedEventsCount = events.info.count;
      this.suggestedEventLoading = false;
    }, err => {
      this.suggestedEventLoading = false;
    });
  }

  public onEventScroll() {
      if(!this.suggestedEventLoading){
          this.suggestedEventLoading = true;
        if (this.suggestSkipCheck) {
          this.getSuggestedEventsSearching();
        }
        this.suggestSkipCheck = false
      }
  }

  public tabChange(value): void {
    this.isFullMap = !value;
    if (this.isFullMap) {
      this._subjectsIteractionsService.pageTags.next({title:`tags.search_map_title`, desc:`tags.search_map_desc`});
      if (this.paramsChanged) {
        this._getDataOfSearchingEvents(false);
      } else {
        this._subjectsIteractionsService.searchedEvents.next(this.fullMapEvents);
      }
    }else{
      this._subjectsIteractionsService.pageTags.next({title:`tags.search_event_title`, desc:`tags.search_event_desc`});
      this._getDataOfSearchingEvents(false);
    }
    this.paramsChanged = false;
    if (value) {
      this._subjectsIteractionsService.searchedEvents.next(this.events);
    }
    this.loadMore = value;
  }

  public checkPopularToggle(e) {
    this.popularity = e;
    this.eventlimit = 15;
    this.eventskip = 0;
    this.events = [];
    this._getDataOfSearchingEvents(false);
  }

  public onScroll(): void {
    if (this.loadMore) {
        this.isScroll = true;
        this.loading = true;
      switch (this._searchForm.get('searchBy').value) {
        case 'user': {
          this.userskip += this.userlimit;
          let value: string = this._searchForm.get('search').value;
          if (value) {
            value = value.trim();
          }
          this._searchUsers(value, this.userSearchingData.userType || 'all', true);
          break;
        }
        case 'event': {
            if(!this.isFullMap){
              if(this.checkScroll){
                this._getDataOfSearchingEvents(true);
              }
              this.checkScroll = false;
            }

          //   if(this.eventskip >= this.fullMapEvents.length){
          // }else{
          //     let length = this.events.length
          //   for(let i = length-1; i<= this.eventskip+1; i++){
          //      this.events.push(this.fullMapEvents[i])
          //   }
          // }
          break;
        }
        case 'group': {
          this.groupskip += this.grouplimit;
          let value: string = this._searchForm.get('search').value;
          if (value) {
            value = value.trim();
          }
          this._searchGroups(value, true);
          break;
        }
        default: {
          this.eventskip = this.events.length + 6;
          this._getDataOfSearchingEvents(true);
        }

      }

    }else if(this._searchForm.get('searchBy').value == 'event'){
        this.onEventScroll()
    }
  }


  private getEventsFromMap(): void {
    this._subjectsIteractionsService.searchedEventsState.subscribe((value => {
      if (value) {
        !value.length ? this.emptyResult = true : null;
      }
    }));
  }

  private _checkEmptyResult(): void {
    switch (this._searchForm.get('searchBy').value) {
      case 'user': {
        ((this.users && this.users.length === 0)) ? this.emptyResult = true : this.emptyResult = false;
        break;
      }
      case 'group': {
        ((this.groups && this.groups.length === 0)) ? this.emptyResult = true : this.emptyResult = false;
        break;
      }
      case 'event': {
        ((this.events && this.events.length === 0)) ? (this.emptyResult = true) : this.emptyResult = false;
        this.emptyResult ? this.getSuggestedEventsSearching() : null;
        this._subjectsIteractionsService.changeMapState(this.emptyResult);
        break;
      }
    }
  }

  public openDialog(name: string, title): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      name: name,
      title: title,
      isDynamicSearch: true
    };
    let dialogRef = this._dialog.open(MatModalComponent, dialogConfig);
  }

  public onClickSearch(): void {
    // gtag('config', 'UA-149369103-1');
    // gtag('event', 'view_search_results');
    this._handleSearchFilters();
  }

  get searchForm(): FormGroup {
    return this._searchForm;
  }

  get searchType(): string {
    return this._searchForm.get('searchBy').value;
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this._queryParamsSubscription.unsubscribe();
    this._searchSubscription.unsubscribe();
    this.mapSubsccription.unsubscribe();
      this.subscription$.next();
      this.subscription$.complete();
  }
}
