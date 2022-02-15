import {Injectable, NgZone} from '@angular/core';
import {AsyncSubject, BehaviorSubject, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {UserService} from './user.service';

@Injectable()
export class GoogleApiService {
  public _userLocation = new ReplaySubject<{ lat: number, lon: number, registrInfo?: boolean, place?: string }>(1);
  public getUserLocation = this._userLocation.asObservable();
  private _geocoder = new google.maps.Geocoder;
  private _latLon = {lat: 0, lon: 0};
  private _loactionIsSet = false;

  constructor(private _ngZone: NgZone,
              private _userService: UserService
  ) {
    this._getUserLocation();
  }

  private _getUserLocation(): void {
    const savedLocation =  this.getSavedLocation();
    if(savedLocation){
      this._userLocation.next({
        lat: savedLocation.lat,
        lon: savedLocation.lng,
        registrInfo: false,
        place: savedLocation.place
      });
    }else{
      navigator.geolocation.getCurrentPosition((position: Position) => {
        this._latLon = {lat: position.coords.latitude, lon: position.coords.longitude};
        this._loactionIsSet = true;
        this._userLocation.next(this._latLon);
      }, (error) => {
        this.getUserLocationByIp();
      });

      setTimeout(() => {
        if (!this._loactionIsSet) {
          this.getUserLocationByIp();
        }
      }, 2000);
    }

  }

  private getSavedLocation(){
    const userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    return userLocation;
  }

  public getUserLocationByIp() {
    this._userService.getUserLocationByIp()
      .subscribe(data => {
        this._loactionIsSet = true;
        this._userLocation.next({
          lat: data.ll[0],
          lon: data.ll[1],
          registrInfo: false,
          place: data.city
        });
      }, error1 => {
        this._userLocation.next(null);
        this._userLocation.error(error1);
      });
  }

  public searchAutocomplete(term: string): Observable<Array<string>> {
    if (term === '') {
      return of([]);
    }

    let result = Observable.create(observer => {
      new google.maps.places.AutocompleteService().getPlacePredictions({input: term}, (results, status) => {
        this._ngZone.run(() => {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            observer.next(results.map(result => result.description));
            observer.complete();
          } else {
            observer.next([]);
            observer.complete();
          }
        });
      });
    });
    return result;
  }

  public findPlaceByCoordinates(lat: number, lng: number, placeName = null): Observable<any> {
    const latlng = {lat: Number(lat), lng: Number(lng)};
    const options:any = {};
    if(placeName){
      options.address = placeName
    }else{
      options.location = latlng;
    }
    return Observable.create(observer => {
      this._geocoder.geocode(options, (results, status) => {
          if (results && results[0]) {
              const type = results[0].types[0];
              let address = false;
              if ((type !== 'continent') &&
                  (type !== 'country') &&
                  (type !== 'locality') &&
                  (type !== 'administrative_area_level_3')&&
                  (type !== 'administrative_area_level_2') &&
                  (type !== 'administrative_area_level_1')) {
                  address = true;
              }
              this._ngZone.run(() => {
                    observer.next({value:results[0].formatted_address,latLng:results[0].geometry.location.toJSON(), address});
                    observer.complete();
                });
        } else {
          observer.next('');
          observer.complete();
        }
      });
    });
  }
}
