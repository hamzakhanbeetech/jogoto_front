import {Component, OnInit, NgZone, HostListener, ViewChild, EventEmitter} from '@angular/core';
import {FormGroup, FormBuilder, FormControl} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {combineLatest, Subject, Subscription} from 'rxjs';
import {MatModalComponent} from '../mat-modal/mat-modal.component';
import {SubjectsInteractionsService} from '../../../services/subjects-interactions.service';
import {GoogleApiService} from '../../../services/google-api.service';
import {HomeFilterModel} from '../../../models';
import {FiltersService, UtilitesService} from '../../../services';
import {takeUntil} from 'rxjs/operators';
import * as moment from 'moment';


declare const google;
declare const ga: Function;

@Component({
  selector: 'app-home-filter-section',
  templateUrl: './home-filter-section.component.html',
  styleUrls: ['./home-filter-section.component.scss']
})
export class HomeFilterSectionComponent implements OnInit {
  private _searchSubscription: Subscription = new Subscription();
  private subscription$: Subject<void> = new Subject<void>();
  private _geocoder = new google.maps.Geocoder;
  private _searchForm: FormGroup;
  public place: string;
  public title: any;
  public placeRegistrInfo: boolean;
  private _windowWidth: boolean = window.innerWidth < 568;
  public smallDisplay: boolean = window.innerWidth < 568;
  public resetButton: boolean = false;
  private autocompleteChecked: boolean = false;
  private isAddress: boolean = false;
  @ViewChild('searchInputText', { static: true }) public searchInputText: any;
  public inputFocused: boolean = true;
  public updatedLocation;
  public showLocation: boolean = true;
  public locationChangedText = sessionStorage.getItem('userLocation') ? 'create-event.location' : 'home.api_location';

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth > 575) {
      this._dialog.closeAll();
      this.smallDisplay = false;
    } else {
      this.smallDisplay = true;
    }
  }

  constructor(
    private _router: Router,
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _dialog: MatDialog,
    private _subjectInteractionService: SubjectsInteractionsService,
    private _ngZone: NgZone,
    private translate: TranslateService,
    private googleApi: GoogleApiService,
    private _utilitiesService: UtilitesService,
    private _filtersService: FiltersService
  ) {
    this._filtersService.resetFilters();
  }

  ngOnInit() {
    this._formBuilder();
    this._findUserLocation();
    this.isSearchFromFilter();
    this.isAutocompleteChecked();
    this.translate.get(['filter.choose_location', 'filter.event_filters', 'filter.categories', 'filter.date_filters'])
      .pipe(takeUntil(this.subscription$))
      .subscribe(data => {
        this.title = {
          dropdownFilter: data['filter.event_filters'],
          dropdownWhen: data['filter.date_filters'],
          dropdownWhere: data['filter.choose_location'],
          dropdownCats: data['filter.categories'],
        };
      })
  }

  public showLocationAutocomplite() {
    this.showLocation = false;
  }

  public searchText(e) {
    if (e.target.value) {
      this.resetButton = true;
    } else {
      this.resetButton = false;
    }
  }

  public resetSearchText(): void {
    this.searchInputText.nativeElement.value = '';
    if (this.inputFocused) {
      this.searchInputText.nativeElement.focus();
    }
    this.searchForm.get('search').patchValue('');
    this.resetButton = false;
  }

  public inputBlur(event) {
    const elementId = event.target.id;
    this.inputFocused = elementId == 'close' || elementId == 'reset';
  }

  private isSearchFromFilter() {
    this._subjectInteractionService.searchFromFilterState
      .pipe(takeUntil(this.subscription$))
      .subscribe(() => {
        this.onClickSearch()
      })
  }

  private _findUserLocation(): void {
    this.googleApi.getUserLocation
      .pipe(takeUntil(this.subscription$))
      .subscribe((value) => {
        this.placeRegistrInfo = value.registrInfo;
        if (value) {
          if (!!value.place) {
            this.place = value.place;
            this._filtersService.setAutocomplete({autocomplete: this.place, latLng: {lat: value.lat, lng: value.lon}});
            this._subjectInteractionService.userPlace.next({
              place: this.place,
              lat: value.lat,
              lng: value.lon,
              registrInfo: value.registrInfo
            });
          } else {
            this._ngZone.run(() => {
              this._findPlaceByCoordinates(value.lat, value.lon, value.registrInfo);
            });
          }
        } else {
          this._subjectInteractionService.userPlace.next(null);
        }
      });
  }

  public changeUserLocation(event) {
    this.updatedLocation = event;
  }

  public saveNewLocation() {
    if (this.updatedLocation && this.updatedLocation.autocomplete) {
      this.place = this.updatedLocation.autocomplete;
      this._filtersService.setAutocomplete({
        autocomplete: this.place,
        latLng: {lat: this.updatedLocation.latLng.lat, lng: this.updatedLocation.latLng.lng}
      });
      const data = {
        place: this.place,
        lat: this.updatedLocation.latLng.lat,
        lng: this.updatedLocation.latLng.lng,
        registrInfo: false
      };
      this._subjectInteractionService.userPlace.next(data);
      this.googleApi._userLocation.next({
        lat: data.lat,
        lon: data.lng,
        registrInfo: data.registrInfo,
        place: this.place
      });
      sessionStorage.setItem('userLocation', JSON.stringify(data));
      this.locationChangedText = sessionStorage.getItem('userLocation') ? 'create-event.location' : 'home.api_location'
    }
    this.showLocation = false;
    this.onClickSearch();
  }

  private _findPlaceByCoordinates(lat: number, lng: number, registrInfo: boolean): void {
    const latlng = {lat: lat, lng: lng};
    this._geocoder.geocode({'location': latlng}, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          const type = results[0].types[0];
          let address = false;
          if ((type !== 'continent') &&
            (type !== 'country') &&
            (type !== 'locality') &&
            (type !== 'administrative_area_level_3') &&
            (type !== 'administrative_area_level_2') &&
            (type !== 'administrative_area_level_1')) {
            address = true;
          }
          this.isAddress = address;
          const savedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
          this._ngZone.run(() => {
            if (savedLocation) {
              this.place = savedLocation.place;
              this._filtersService.setAutocomplete({
                autocomplete: this.place,
                latLng: {lat: savedLocation.lat, lng: savedLocation.lng},
                isAddress: true
              });
              this._subjectInteractionService.userPlace.next({
                place: this.place,
                lat: savedLocation.lat,
                lng: savedLocation.lng,
                registrInfo: false,
                address: true
              });
            } else {
              this.place = results[0].formatted_address;
              this._filtersService.setAutocomplete({autocomplete: this.place, latLng: {lat, lng}, isAddress: address});
              this._subjectInteractionService.userPlace.next({place: this.place, lat, lng, registrInfo, address});
            }
          });
        } else {
          this._subjectInteractionService.errorSuccessMessag.next({
            type: 'error', messageText: 'No results found',
            display: true
          });
        }
      } else {
        this._subjectInteractionService.errorSuccessMessag.next({
          type: 'error', messageText: 'Geocoder failed due to: ' + status,
          display: true
        });
      }
    });
  }

  private findPlaceByName(query) {
    this.googleApi.findPlaceByCoordinates(null, null, query)
  }

  private _formBuilder(): void {
    this._searchForm = this._fb.group({
      search: new FormControl()
    });
  }

  private isAutocompleteChecked() {
    this._subjectInteractionService.autocompleteCheckedState
      .pipe(takeUntil(this.subscription$))
      .subscribe((value) => {
        this.autocompleteChecked = value;
      })
  }

  public onClickSearch(): void {
    this._windowWidth = window.innerWidth < 568;

    let params = new HomeFilterModel();
    let lat: null | string = null;
    let lon: null | string = null;
    this._subjectInteractionService.onSearch.next(true);
    this._subjectInteractionService.searchInputValue.next(this._searchForm.value.search);

    const combined = combineLatest(
      this._subjectInteractionService.filterWhenState,
      this._subjectInteractionService.filterWhereState,
      // this._subjectInteractionService.filterState,
      this._subjectInteractionService.categoryFiltetState
    );

    // if (this._windowWidth) {
    //   let parsedObjectCat;
    //   let parsedObjectFil;
    //   let parsedObjectDate;
    //   let parsedObjectAuto;
    //   let distance: string;
    //
    //   parsedObjectCat = this._filtersService.getSelectedFilters().categories;
    //   parsedObjectFil = this._filtersService.getSelectedFilters().filters;
    //   parsedObjectDate = this._filtersService.getSelectedFilters().calendar;
    //   parsedObjectAuto = this._filtersService.getSelectedFilters().autocomplete;
    //   if (this._filtersService.getSelectedFilters().distance) {
    //     distance = this._filtersService.getSelectedFilters().distance.toString()
    //   } else {
    //     distance = null
    //   }
    //
    //   if (parsedObjectCat && parsedObjectCat.categories) {
    //     params.categoryFilter = parsedObjectCat.categories.toString();
    //   }
    //   if (parsedObjectFil && parsedObjectFil.filters) {
    //     params.filter = parsedObjectFil.filters.toString();
    //   }
    //   if (parsedObjectDate && parsedObjectDate.fromDate && parsedObjectDate.toDate) {
    //     params.fromDate = parsedObjectDate.fromDate ? moment(parsedObjectDate.fromDate.year + '-' + parsedObjectDate.fromDate.month + '-' + parsedObjectDate.fromDate.day).format('YYYY-MM-DD').toString() : null;
    //     params.toDate = parsedObjectDate.toDate ? moment(parsedObjectDate.toDate.year + '-' + parsedObjectDate.toDate.month + '-' + parsedObjectDate.toDate.day).format('YYYY-MM-DD').toString() : null;
    //   }
    //   // else {
    //   //   const dates = this._utilitiesService.getDefaultDates();
    //   //   params.fromDate = dates.start_date;
    //   //   params.toDate = dates.end_date
    //   // }
    //
    //   // console.log('home-filter-section', params)
    //
    //   if (parsedObjectAuto && parsedObjectAuto.autocomplete && parsedObjectAuto.latLng) {
    //     params.autocomplete = parsedObjectAuto.autocomplete;
    //     lat = parsedObjectAuto.latLng.lat;
    //     lon = parsedObjectAuto.latLng.lng;
    //   }
    //   if (distance) {
    //     params.distance = distance;
    //   }
    //   this._navToSearch(params, lat, lon);
    // } else {
      // this._searchSubscription = combined.subscribe(async (value) => {
      //   console.log(value)
      //   await value.forEach(element => {
      //     Object.keys(element).forEach((el: string) => {
      //       params[el] = element[el];
      //     });
      //   });
      //   console.log(params)
      //   if (params.latLng.lat) {
      //     lat = params.latLng.lat;
      //     lon = params.latLng.lng;
      //   }
      //   this._searchSubscription.unsubscribe();
      //   this._navToSearch(params, lat, lon);
      // });
      //
      //
      // trigger.next(true)
      // console.log(this._searchSubscription.next())
      // combined.next(true)
      // this._subjectInteractionService.searchInputValue.next(this._searchForm.value.search);

      // --------

      let parsedObjectCat;
      let parsedObjectFil;
      let parsedObjectDate;
      let parsedObjectAuto;
      let distance: string;
      let parsedObjectOnline: boolean

      parsedObjectCat = this._filtersService.getSelectedFilters().categories;
      parsedObjectFil = this._filtersService.getSelectedFilters().filters;
      parsedObjectDate = this._filtersService.getSelectedFilters().calendar;
      parsedObjectAuto = this._filtersService.getSelectedFilters().autocomplete;
      parsedObjectOnline = this._filtersService.getSelectedFilters().isOnline;

      if (this._filtersService.getSelectedFilters().distance) {
        distance = this._filtersService.getSelectedFilters().distance.toString()
      } else {
        distance = null
      }

      if (parsedObjectCat && parsedObjectCat.categories) {
        params.categoryFilter = parsedObjectCat.categories.toString();
      }
      if (parsedObjectFil && parsedObjectFil.filters) {
        params.filter = parsedObjectFil.filters.toString();
      }
      if (parsedObjectDate && parsedObjectDate.fromDate && parsedObjectDate.toDate) {
        params.fromDate = parsedObjectDate.fromDate ? moment(parsedObjectDate.fromDate.year + '-' + parsedObjectDate.fromDate.month + '-' + parsedObjectDate.fromDate.day).format('YYYY-MM-DD').toString() : null;
        params.toDate = parsedObjectDate.toDate ? moment(parsedObjectDate.toDate.year + '-' + parsedObjectDate.toDate.month + '-' + parsedObjectDate.toDate.day).format('YYYY-MM-DD').toString() : null;
      }
      // else {
      //   const dates = this._utilitiesService.getDefaultDates();
      //   params.fromDate = dates.start_date;
      //   params.toDate = dates.end_date
      // }

      // console.log('home-filter-section', params)

      if (parsedObjectAuto && parsedObjectAuto.autocomplete && parsedObjectAuto.latLng && !parsedObjectOnline) {
        params.autocomplete = parsedObjectAuto.autocomplete;
        lat = parsedObjectAuto.latLng.lat;
        lon = parsedObjectAuto.latLng.lng;
      }
      if (parsedObjectOnline) {
        params.isOnline = parsedObjectOnline;
      }
      if (distance) {
        params.distance = distance;
      }

      this._navToSearch(params, lat, lon);

    // }
  }

  public openDialog(name: string, title): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {name, title};
    let dialogRef = this._dialog.open(MatModalComponent, dialogConfig);
  }

  private _navToSearch(params, lat, lon): void {
    let searchValue = this._searchForm.value.search;
    !(params.autocomplete) ? params.distance = null : null;
    const localizedUrl = this._utilitiesService.localizeRouter('/search');
    // if (!this.autocompleteChecked && searchValue && searchValue.trim().length > 1) {
    //   const trimedValue = searchValue.trim();
    //   this.googleApi.findPlaceByCoordinates(null, null, trimedValue)
    //     .subscribe(({value, latLng, address}) => {
    //       if (value && value.trim().toLowerCase().includes(trimedValue.toLowerCase()) && !address) {
    //         this._ngZone.run(() => {
    //           this._router.navigate([localizedUrl], {
    //             relativeTo: this._activatedRoute,
    //             queryParams: {
    //               type: 'event',
    //               query: trimedValue,
    //               categories: params.categoryFilter || null,
    //               start_date: params.fromDate,
    //               end_date: params.toDate,
    //               autocomplete: value,
    //               filter: params.filter || null,
    //               lat: latLng.lat,
    //               lon: latLng.lng,
    //             }
    //           }).then(() => {
    //             window.scrollTo(0, 0);
    //           });
    //         })
    //       } else {
    //         this._ngZone.run(() => {
    //           this._router.navigate([localizedUrl], {
    //             relativeTo: this._activatedRoute,
    //             queryParams: {
    //               type: 'event',
    //               distance: params.distance,
    //               categories: params.categoryFilter || null,
    //               start_date: params.fromDate,
    //               end_date: params.toDate,
    //               query: trimedValue || null,
    //               autocomplete: params.autocomplete,
    //               filter: params.filter || null,
    //               lat,
    //               lon,
    //               searchedText: trimedValue || null
    //             }
    //           }).then(() => {
    //             window.scrollTo(0, 0);
    //           });
    //         })
    //       }
    //     });
    // } else {

    if (!this.autocompleteChecked && searchValue) {
      params.autocomplete = null
      params.distance = null
      lat = null
      lon = null
    }

      this._ngZone.run(() => {
        this._router.navigate([localizedUrl], {
          relativeTo: this._activatedRoute,
          queryParams: {
            type: 'event',
            query: (searchValue) ? searchValue.trim() : null,
            distance: params.distance,
            categories: params.categoryFilter || null,
            start_date: params.fromDate,
            end_date: params.toDate,
            autocomplete: params.autocomplete,
            filter: params.filter || null,
            isOnline: params.isOnline,
            lat,
            lon,
            searchedText: (searchValue) ? searchValue.trim() : null
          }
        }).then(() => {
          window.scrollTo(0, 0);
        });
      })
    // }
  }

  get searchForm(): FormGroup {
    return this._searchForm;
  }

  ngOnDestroy() {
    this._searchSubscription.unsubscribe();
    this.subscription$.next();
    this.subscription$.complete();
  }
}
