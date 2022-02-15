import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EventModel} from '../../../models/global.models';
import {DatePipe} from '@angular/common';
import {UtilitesService} from '../../../services/utilites.service';
import {SubjectsInteractionsService} from '../../../services';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldsOfSearching} from '../../../views/main/search/search.models';
import {MapConstants} from '../../../constants/map.constants';
import {debounceTime} from 'rxjs/operators';
import {ValidatorHelper} from '../../../helpers/validator.helper';
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: [DatePipe]
})
export class MapComponent implements OnInit, OnDestroy {
    public events: EventModel[] = [];
    private _subscription: Subscription;
    private isFirst: boolean;
    private map;
    private _params: FieldsOfSearching;
    private requestTimer = null;
    private _querySubscription: Subscription = new Subscription();
    public listenOnDrag: boolean = true;
    public showCheckbox: boolean = true;
    private dragListener;
    private zoomListener;
    private inputListener: Subscription = new Subscription();
    private markers = [];
    private flag: boolean;
    private isDraged: boolean = false;
    private initEnd:boolean = false;
    private placeName = "";
    private distance = null;
    private markerIcon = '';
    private markerZIndex = 0;
    private dateFormat  = this._translate.currentLang == 'en'? "EEEE, d MMM At H:mm" : "EEEE, d MMM à H:mm";
    @ViewChild('gmap', { static: true }) public gmapElement: any;
    @Input('isHovered')set isHovered(event){
            this.setHoverMarker(event)
    }


    constructor(private _datePipe: DatePipe,
                private _utilitesService: UtilitesService,
                private _subjectsIteractionsService: SubjectsInteractionsService,
                private _translate: TranslateService,
                private _router: Router,
                private _activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this._queryParams();
        this.Map();
        this._getEvents();
        this.getFilterValue();
        this._subjectsIteractionsService.autocompleteClearState.subscribe((value)=>{
            this.isDraged = false;
        })
    }

private getFilterValue(){
       this.inputListener = this._subjectsIteractionsService.filterWhereState.subscribe((value:any)=>{
            if(value.latLng.lat){
                this.isDraged = false;
                if(value.address){
                    this.distance = value.distance || 50;
                    // this.setZoomLevel(value)
                }
                // console.log(value);
                // this.distance = value.distance;
                // if(value.address){
                //    this.setZoomLevel(value)
                // }else{
                //     this.isDraged = false;
                //     this.flag = true;
                //     console.log('input place');
                //     this.fitToPlaceSize(this.map,value.autocomplete)
                // }
                //
                // this.placeName = value.autocomplete
            }
        })
    }

    private _getEvents(): void {
        this.isFirst = true;
        this._subscription = this._subjectsIteractionsService.searchedEventsState
            .pipe(debounceTime(300))
            .subscribe((value) => {
                this.showCheckbox = true;
                this.listenOnDrag = true;
                this.events = value;
                if (this.events.length) {
                    this._initMap();
                }else{
                   this.removeMarkers();
                    if (!this.isDraged){
                        this.flag = true;
                        this.fitToPlaceSize(this.map,this._params.autocomplete || this.placeName)
                    }
                }
            });
    }

    private setHoverMarker(event){
        for(let marker of this.markers){
            if(marker.get('_id') == event.id){
                if(event.state){
                    const regex = ValidatorHelper.ICON_REGEXP;
                    this.markerIcon = marker.getIcon();

                  this.markerZIndex = marker.getZIndex();
                    let found =  this.markerIcon.match(regex);
                    if(!found){
                        found = [];
                        found[1] = 'icon-others'
                    }
                    marker.setIcon(`./assets/images/map/${found[1]}-outline.svg`)
                    marker.setZIndex(1000)

                }else{
                    marker.setIcon(this.markerIcon);
                    marker.setZIndex(this.markerZIndex)
                }
            }
        }
    }

    private setZoomLevel(value){
        if ( this.distance >= 30 &&  this.distance <= 50) {
            this.map.setZoom(11);
        }

        if ( this.distance >= 20 &&  this.distance < 30) {
            this.map.setZoom(12);
        }

        if ( this.distance >= 10 &&  this.distance < 20) {
            this.map.setZoom(13);
        }

        if ( this.distance >= 7 &&  this.distance < 10) {
            this.map.setZoom(14);
        }

        if ( this.distance >= 3 &&  this.distance < 7) {
            this.map.setZoom(15);
        }

        if ( this.distance >= 1 &&  this.distance < 3) {
            this.map.setZoom(16);
        }
        const center = new google.maps.LatLng(value.latLng.lat, value.latLng.lng);
        this.map.setCenter(center)
    }

    private removeMarkers(){
        for(let marker of this.markers){
            marker.setMap(null)
        }
    }

    private fitToPlaceSize(map,address){
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': address}, (results, status)=> {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.fitBounds(results[0].geometry.viewport);
                this.isDraged = false;
                // this._getMapCoordinatesOnChange(map, true);
            }
        });
    }

    private prepareEvents(events){
        const result = [];
        for(let event of events){
            result.push({
                id:event._id,
                name:event.name,
                position:event.position,
                category:event.category,
                location: event.location
            });
        }
    }

    private Map() {
        let center = {lat:46.7912769,lng: 5.9814056};
        if(this._params.lat){
            center = {lat:+this._params.lat, lng:+this._params.lon}
        }
        // set initial map options
        this.map = new google.maps.Map(this.gmapElement.nativeElement, {
            fullscreenControl: false,
            maxZoom: 17,
            zoom: 10,
            center,
          gestureHandling: "greedy"
        });
        this.addListeners();
    }

    private _contentString(id: string, title: string, picture: string, date: string): string {

        return `<div class="d-flex map-info overflow-hidden">
                    <a href="en/event/${id}" class="d-block map-info__image my-0 " target="_blank">
                        <img src="${picture}" class="w-100" alt="${title}">
                    </a>
                    <article class="info-block">
                        <a href="en/event/${id}" class="map-info__title mw-100 text-truncate text-decoration-none d-inline-block" target="_blank">${title}</a>
                        <p class="map-info__date m-0 text-truncate mw-100">${date}</p>
                    </article>
                </div>`;
    }

    private _getDistance(map): number {
        const lat = map.getCenter().lat();
        const lng = map.getCenter().lng();
        const center = new google.maps.LatLng(lat, lng);
        const bounds = map.getBounds();
        const northEast = bounds.getNorthEast();
        const edgePoint = new google.maps.LatLng(center.lat(),northEast.lng());
        let distance = google.maps.geometry.spherical.computeDistanceBetween(center,edgePoint) / 1000;
        return distance;
    }


    private addListeners() {
        if (this.map) {
            this.dragListener = this.map.addListener('dragend', () => {
              if (this.listenOnDrag) {
                this.isDraged = true;
                    this._getMapCoordinatesOnChange(this.map, true, true);
                } else {
                    this.showCheckbox = false;
                }
            });

            this.zoomListener = google.maps.event
                .addListener(this.map, 'zoom_changed', () => {
                    if (this.listenOnDrag) {
                        if (!this.flag && this.initEnd) {
                            this.isDraged = true;
                            this._zoomChange(this.map);
                        } else {
                            this.flag = false;
                        }
                    } else {
                        this.showCheckbox = false;
                    }
                });
        }
    }

    private _initMap(): void {
        this.initEnd = false;
        let locations = [];

        if (this.markers.length && this.events.length) {
            this.removeMarkers();
        }

       locations = this.events.map(event => {
            return {
                lat: event.location.coordinates[0],
                lng: event.location.coordinates[1]
            };
        });

        for (let i = 0; i < locations.length; i++) {
            const location = locations[i];
            const sortedDate = this._utilitesService._sortDates(this._utilitesService.checkDateTimeZone(this.events[i].dates), new Date());
            const startDate = sortedDate ? sortedDate : this._utilitesService.checkDateTimeZone(this.events[i].dates)[0];
            const date = this._datePipe.transform(startDate.start, this.dateFormat,undefined, this._translate.currentLang);
            const infoCard = this._contentString(
                this.events[i]._id,
                this.events[i].name,
                this.events[i].poster.cropped.link,
                date);
            let marker;
            if (this.events[i].category[0]) {
                marker = new google.maps.Marker({
                    position: location,
                    map: this.map,
                    title: this.events[i].category[0].name,
                    icon: `./assets/images/map/${this.events[i].category[0].styleData.icon}.svg`
                });
            } else {
                marker = new google.maps.Marker({
                    position: location,
                    map: this.map,
                    title: 'test',
                    icon: `./assets/images/map/icon-business.svg`
                });
            }
            marker.set('_id', this.events[i]._id);
            google.maps.event.addListener(marker, 'click', (evt) => {
                const infoWin = new google.maps.InfoWindow();
                infoWin.setContent(infoCard);
                infoWin.open(this.map, marker);
            });
            this.markers.push(marker);
        }
        this.fitMarkers();

        this.initEnd = true;
    }

    private fitMarkers(){
        let bounds = new google.maps.LatLngBounds();
        let boundIsNull = true;
        for (let marker of this.markers) {
            if (marker.getMap() != null) {
                boundIsNull = false;
                bounds.extend(marker.getPosition());
            }
        }
        this.isFirst = false;
        if (!boundIsNull) {
            if (!this.isDraged) {
                this.flag = true;
                this.map.setCenter(bounds.getCenter());
                this.map.fitBounds(bounds);
            }
        }
    }

    private _getMapCoordinatesOnChange(map, type = true, isDrag = false) {
        this.removeMarkers();
        this.markers = [];
        const lat = map.getCenter().lat();
        const lng = map.getCenter().lng();
        if(isDrag){
          this._subjectsIteractionsService.mapDargedPlace.next()
        }
        const bounds = map.getBounds();
        const southWestLat = type ? bounds.getSouthWest().lat():null,
            southWestLng = type ? bounds.getSouthWest().lng():null,
            northEastLat = type ? bounds.getNorthEast().lat():null,
            northEastLng = type ? bounds.getNorthEast().lng():null,
            northWestLat = type ? bounds.getNorthEast().lat():null,
            northWestLng = type ? bounds.getSouthWest().lng():null,
            southEastLat = type ? bounds.getSouthWest().lat():null,
            southEastLng = type ? bounds.getNorthEast().lng():null;

            this._getNewEventOnDrag(
                {lat, lng},
                this.distance,
                { southWestLat,
                southWestLng,
                northEastLat,
                northEastLng,
                northWestLat,
                northWestLng,
                southEastLat,
                southEastLng
            });
    }

    private _getNewEventOnDrag(center, distance, locations) {
      const {southWestLat,
            southWestLng,
            northEastLat,
            northEastLng,
            northWestLat,
            northWestLng,
            southEastLat,
            southEastLng} = locations;
        const {autocomplete, categories, filter, type, end_date, start_date, query, searchedText} = this._params;
        const options: any = {
            categories,
            filter,
            type,
            query,
            searchedText,
            start_date,
            end_date,
            lat: center.lat,
            lon: center.lng,
            drag:true,
            zoom: this.map.getZoom(),
            southWestLat,
            southWestLng,
            northEastLat,
            northEastLng,
            northWestLat,
            northWestLng,
            southEastLat,
            southEastLng};
      const localisedUrl = this._utilitesService.localizeRouter('/search');

      this._router.navigate([localisedUrl], {
            relativeTo: this._activatedRoute,
            queryParams: options
        });
    }

    private _zoomChange(map): void {
        const zoom = map.getZoom();
        if (zoom < MapConstants.SIZE.max_zoom && zoom >= MapConstants.SIZE.min_zoom) {
                this._getMapCoordinatesOnChange(map, true);
        }
    }

    private _queryParams() {
        this._querySubscription = this._activatedRoute.queryParams.subscribe((params: FieldsOfSearching) => {
            this._params = params;
            if(params.isSearched){
                this.isDraged = false;
            }
        });
    }

    public searchCheckbox(value) {
        this.listenOnDrag = value.checkboxValue;
    }

    public onClickSearch() {
        this._getMapCoordinatesOnChange(this.map);
        this.showCheckbox = true;
    }

    private prepareMarkers() {
        const newEvents = [];
        const newMarkers = [];

        for (let i = 0; i < this.events.length; i++) {
            let flag = false;

            for (var j = 0; j < this.markers.length; j++) {
                if (this.events[i]._id === this.markers[j].get('_id')) {
                    flag = true;
                    break;
                }
            }

            if (!flag && this.events[i]) {
                newEvents.push(this.events[i]);
            } else {
                newMarkers.push(this.markers[j]);
            }
        }

        for (let i = 0; i < this.markers.length; i++) {
            let flag1 = false;

            for (let j = 0; j < this.events.length; j++) {
                if (this.markers[i].get('_id') === this.events[j]._id) {
                    flag1 = true;
                }
            }

            if (!flag1 && this.markers[i]) {
                this.markers[i].setMap(null);
            }
        }

        this.events = newEvents;
        this.markers = newMarkers;
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
        if (this.requestTimer) {
            clearTimeout(this.requestTimer);
        }
        this.inputListener.unsubscribe();
        this.dragListener.remove();
        this.zoomListener.remove();
        this._querySubscription.unsubscribe();
    }
}
