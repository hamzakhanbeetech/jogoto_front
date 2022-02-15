import {ActivatedRoute, Router} from '@angular/router';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectorRef, NgZone} from '@angular/core';
import {SubjectsInteractionsService} from '../../../services/subjects-interactions.service';
import {Subscription} from 'rxjs';
import {FieldsOfSearching} from '../../../views/main/search/search.models';
import {FiltersService} from '../../../services/filters.service';
import {SidebarFilterService} from '../../../services/sidebar-filter.service';
import {UtilitesService} from "../../../services";

@Component({
  selector: 'app-event-filter-where-content',
  templateUrl: './event-filter-where-content.component.html',
  styleUrls: ['./event-filter-where-content.component.scss']
})
export class EventFilterWhereContentComponent implements OnInit, OnDestroy {

  public valueOfRadius: number = undefined;
  public valueOfAutocomplete: string = '';
  public defaultPlace: string = '';
  public latLngOfAutocomplete: { lat: string, lng: string } = {lat: '', lng: ''};
  private _subscription: Subscription;
  private _dynamicSearchEventStateSubscription: Subscription = new Subscription();
  private _queryParamsSubscription: Subscription = new Subscription();
  private _searchSubscription: Subscription = new Subscription();
  @Input('isDynamicSearch') private _isDynamicSearch: boolean = false;
  private _searchingData: FieldsOfSearching = {} as FieldsOfSearching;
  @Output() valuesOfWhere = new EventEmitter<{ radius: number, autocomplete: { autocomplete: string, latLng: any } }>();
  private _windowWidth: boolean = window.innerWidth < 568;
  public isAddress:boolean = false;

  @Input()
  public saveState = false;

  @Input('isClosed')
  private set sendData(value) {
    if (value && !value.isClosed) {
        if (this._isDynamicSearch) {
        let radius = this.valueOfRadius || 50;
          !(this.valueOfAutocomplete) ? radius = null : null;
          this._subjectInteractionService.filterWhere.next({
              distance: radius,
              autocomplete: this.valueOfAutocomplete || null,
              latLng: this.latLngOfAutocomplete || null,
              address: this.isAddress
          });
          this._subjectInteractionService.autocompleteChecked.next(true);
          this._navToSearch();
      } else if (!this.saveState && value.isOk) {
        this._subjectInteractionService.searchFromFilter.next(true);
      }
    }
  }

  constructor(
    private _subjectInteractionService: SubjectsInteractionsService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _ngZone: NgZone,
    private _filtersService: FiltersService,
    private _cdr: ChangeDetectorRef,
    private utilitesService: UtilitesService
  ) {
  }

  ngOnInit() {
    this._handleSearchEvent();
    this._handleDynamicSearchEvent();
    this._checkQueryParams();
  }

  private _handleSearchEvent(): void {
    this._subscription = this._subjectInteractionService.onSearchState.subscribe(async (data: boolean) => {
        let isSearch = await data;
        let radius = this.valueOfRadius || 50;
      this._subjectInteractionService.filterWhere.next({
        distance: radius,
        autocomplete: this.valueOfAutocomplete || null,
        latLng: this.latLngOfAutocomplete || null
      });
      // this._navToSearch()
    });
  }

  private _handleDynamicSearchEvent(): void {
    this._dynamicSearchEventStateSubscription = this._subjectInteractionService
      .dynamicSearchState.subscribe(async (dynamicSearch) => {
        this._isDynamicSearch = dynamicSearch;
        this._cdr.detectChanges();
      });
  }

  private _checkQueryParams(): void {
    this._searchSubscription = this._activatedRoute.queryParams
      .subscribe((params: FieldsOfSearching) => {
        this._searchingData = params;
        this.valueOfAutocomplete = this._searchingData.autocomplete;
        this.latLngOfAutocomplete = {lat: this._searchingData.lat || null, lng: this._searchingData.lon || null};
      });
  }

  public getRadius(event): void {
    if (event) {
        this.valueOfRadius = event;

      if (this.saveState) {
        SidebarFilterService.setFilterData({radius: event});
      }

      this._saveValues('distance');
    }
  }

  public getIsOnline(){

  }

  public getAutocomplete(event): void {
    if (event && event.autocomplete != null || !!event.autocomplete && event.latLng) {

      if (this.saveState) {
        SidebarFilterService.setFilterData({
          autocomplete: event.autocomplete,
          latLng: event.latLng
        });
      }
        this.valueOfAutocomplete = event.autocomplete;
        this.latLngOfAutocomplete = event.latLng;
        this._ngZone.run(()=>{
            this.isAddress = event.address;
        })

        if(event.isMap && event.autocomplete ){
        this._navToSearch()
      }

      this._saveValues('autocomplete');
    }
  }

  private _navToSearch(): void {
    let type = this._searchingData.type || 'event';
    let radius = this.valueOfRadius || 50;
      !(this.valueOfAutocomplete) ? radius = null : null;
      if (type == 'event') {
          const searchInputValue = this._subjectInteractionService.searchInputValue.getValue();
        const localisedUrl = this.utilitesService.localizeRouter('/search');
        this._router.navigate([localisedUrl], {
        relativeTo: this._activatedRoute,
        queryParams: {
          type: 'event',
          distance: radius,
          categories: this._searchingData.categories || null,
          start_date: this._searchingData.start_date || null,
          end_date: this._searchingData.end_date || null,
          query: searchInputValue || null,
          autocomplete: this.valueOfAutocomplete || null,
          filter: this._searchingData.filter || null,
          lat: this.latLngOfAutocomplete.lat,
          lon: this.latLngOfAutocomplete.lng,
            southWestLat:this._searchingData.southWestLat|| null,
            southWestLng:this._searchingData.southWestLng|| null,
            northEastLat:this._searchingData.northEastLat|| null,
            northEastLng:this._searchingData.northEastLng|| null,
            northWestLat:this._searchingData.northWestLat|| null,
            northWestLng:this._searchingData.northWestLng|| null,
            southEastLat:this._searchingData.southEastLat|| null,
            southEastLng:this._searchingData.southEastLng|| null,
            searchedText:this._searchingData.searchedText || null,
        }
      });
    }
  }

  private _saveValues(key: string): void {
      // if (this._windowWidth) {
      switch (key) {
        case 'autocomplete': {
          this._filtersService.setAutocomplete({autocomplete: this.valueOfAutocomplete, latLng: this.latLngOfAutocomplete});
          break;
        }
        case 'distance': {
          this._filtersService.setDistance(this.valueOfRadius);
          break;
        }
      }

    // }
  }

  get isDynamicSearch(): boolean {
    return this._isDynamicSearch;
  }

  ngOnDestroy() {
    if (this._windowWidth && this.isDynamicSearch) {
        this._subjectInteractionService.autocompleteChecked.next(true);
        this._navToSearch();
    }
    this._subscription.unsubscribe();
    this._queryParamsSubscription.unsubscribe();
    this._dynamicSearchEventStateSubscription.unsubscribe();
    this._searchSubscription.unsubscribe();
  }
}
