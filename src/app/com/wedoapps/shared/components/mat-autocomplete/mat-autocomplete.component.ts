import {first, takeUntil} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {Subject, Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

import {FiltersService, GoogleApiService, SubjectsInteractionsService} from '../../../services';
import {SidebarFilterService} from '../../../services/sidebar-filter.service';
import AutocompletePrediction = google.maps.places.AutocompletePrediction;
import {TranslateService} from '@ngx-translate/core';

declare const google;

@Component({
  selector: 'app-mat-autocomplete',
  templateUrl: './mat-autocomplete.component.html',
  styleUrls: ['./mat-autocomplete.component.scss'],
})

export class MatAutocompleteComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public placeholder: string;
  @Input()
  public inCreatePage: boolean;
  @Input('isDynamicSearch')
  private _isDynamicSearch: boolean = false;
  @Input()
  public saveState = false;
  @Input()
  public isUserLocation = false;

  @Output()
  public blur = new EventEmitter<void>();
  @Output()
  public autocomplete = new EventEmitter<object>();

  public myControl = new FormControl();
  public options: AutocompletePrediction[];
  public isOpen: boolean;
  public keyword = 'description';

  private _latLng: object;
  private _searchingAutocomplete: string = '';
  private _windowWidth: boolean = window.innerWidth < 568;
  private _createEventDuplicatedSubscriber: Subscription = new Subscription();
  private routeSubscription: Subscription;
  private unsubscribe$: Subject<void> = new Subject<void>();
  isOnline = false

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _subjectInteractionService: SubjectsInteractionsService,
    private _filtersService: FiltersService,
    private _googleApi: GoogleApiService,
    private _ngZone: NgZone,
    private _cdr:ChangeDetectorRef,
    private _translate: TranslateService,
  ) {
    this._checkQueryParams();
  }

  ngOnInit() {
    this._checkSmallDevice();
    this._subscribeToCreateEvent();
      if (this.saveState) {
      SidebarFilterService.getFilterAsObservable()
        .pipe(
          first())
        .subscribe((data: any) => {
          if (!!data && !!data.autocomplete && data.latLng) {
            this.myControl.setValue(data.autocomplete);
            this._latLng = data.latLng;
          }
        });

      SidebarFilterService.resetAction
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.myControl.setValue('');
          this._latLng = null;
        });
    }
    // this.getDefaultPlace();
      this._subjectInteractionService.mapDargedPlaceState.subscribe(data =>{
        this.myControl.patchValue('');
      })
      this._filtersService.isOnline.subscribe((resp:boolean) => {
        this.isOnline = resp
      })
  }

  private getDefaultPlace(){
      if(!this._windowWidth && this._router.url.length <= 3){
          const data = this._subjectInteractionService.$userPlace
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(data => {
                  if(data){
                      this.myControl.setValue(data.place);
                      this._latLng = {
                          lat: data.lat,
                          lng: data.lng
                      };
                      this.autocomplete.emit({autocomplete: data.place, latLng: this._latLng, address: data.address});
                  }
              })
      }
  }

  ngAfterViewInit() {
    this.inCreatePage ? this.myControl.setValue(null) : null;
    this._cdr.detectChanges();
  }

  private _subscribeToCreateEvent(): void {
    this._createEventDuplicatedSubscriber = this._subjectInteractionService
        .eventCreateDuplicated
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((event: any) => {
          if (!event.admins) {
            this.myControl.setValue(event.location.address.address);
            this.getLatLng(event.location.address.address);
          } else {
            this.myControl.setValue(event.address.full);
            this.getLatLng(event.address.full);
          }
        });
  }

  private _checkQueryParams(): void {
    this.routeSubscription = this._route.queryParams.pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this._searchingAutocomplete = data.autocomplete || '';
        if (data.autocomplete) {
            if (data.autocomplete != this.myControl.value) {
            this.myControl.patchValue(data.autocomplete);
              this.getLatLng(data.autocomplete)
          }
        } else if (data.lat) {
          // this._googleApi.findPlaceByCoordinates(data.lat, data.lon)
          //     .pipe(takeUntil(this.unsubscribe$))
          //     .subscribe((value) => {
          //         this.myControl.patchValue(value);
          //         this._latLng = {
          //             lat: data.lat,
          //             lng: data.lon
          //         };
          //         if(value == ''){
          //             if( this._translate.currentLang == 'fr'){
          //                 value = "Lieu Inconnu"
          //             }else{
          //                 value = "Unknown Location"
          //             }
          //         }
          //         this._subjectInteractionService.mapDargedPlace.next(value)
          //         this.autocomplete.emit({autocomplete: value, latLng: this._latLng, isMap:true});
          // });
        } else {
          this.myControl.patchValue('');
        }
      });
  }

  public choose(value: AutocompletePrediction): void {
    this.myControl.setValue(value.description, {emitEvent: false});
    this.getLatLng(value.description);
    if(!this.isUserLocation){
      this._subjectInteractionService.autocompleteChecked.next(true);
    }
    this.isOpen = false;
  }

  public enterKeyEvent(){
    this.myControl.setValue(this.options[0].description, {emitEvent: false});
    this.getLatLng(this.options[0].description);
    if(!this.isUserLocation){
      this._subjectInteractionService.autocompleteChecked.next(true);
    }
    this.isOpen = false;
  }

  public inputCleared(): void {
    SidebarFilterService.setFilterData({
      autocomplete: null,
      latlng: null
    });
    this.options = [];
    this._latLng = {
      lat: '',
      lng: ''
    };
    this._subjectInteractionService.autocompleteChecked.next(false);
    this.autocomplete.emit({autocomplete: '', latLng: this._latLng});
    const doc  = <HTMLElement>document.querySelector('.autocomplete-container .input-container input')
    doc.focus();
  }

  public _getPlaceAutocomplete(search): void {
    if (search && search.trim().length > 1) {
        new google.maps.places.AutocompleteService()
        .getPlacePredictions({input: search}, (predictions) => {
          if (predictions) {
              this._ngZone.run(()=>{
                this.autocomplete.emit({autocomplete: predictions[0].description, latLng:
                  this.getLatLng(predictions[0].description)});
                  return this.options = predictions;
              });
          } else {
            this._latLng = {
              lat: '',
              lng: ''
            };

            this.autocomplete.emit({autocomplete: search, latLng: this._latLng});
          }
        });
      this.isOpen = true;
    }else{
        this._subjectInteractionService.autocompleteChecked.next(false)
    }
  }

  private _checkSmallDevice(): void {
    if (this._windowWidth && !this._isDynamicSearch) {
      const parsedObjectAuto = this._filtersService.getSelectedFilters().autocomplete;
      const value: string = parsedObjectAuto && parsedObjectAuto.autocomplete ? parsedObjectAuto.autocomplete : '';
      this.myControl.setValue(value);
    }
  }

  private getLatLng(placeName) {
    const geocoder = new google.maps.Geocoder;
    geocoder.geocode({address: placeName}, (val) => {
        const type = val[0].types[0];
        let address = false;
        if ((type !== 'continent') &&
            (type !== 'country') &&
            (type !== 'locality') &&
            (type !== 'administrative_area_level_3')&&
            (type !== 'administrative_area_level_2') &&
            (type !== 'administrative_area_level_1')) {
            address = true;
        }
      if (val && val.length) {
        this._latLng = {
          lat: val[0].geometry.location.lat(),
          lng: val[0].geometry.location.lng()
        };

          this.autocomplete.emit({autocomplete: placeName, latLng: this._latLng, address});
      }
    });
  }

  ngOnDestroy() {
    this._createEventDuplicatedSubscriber.unsubscribe();
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
